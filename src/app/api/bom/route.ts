import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const componentSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().positive(),
})

const operationSchema = z.object({
  name: z.string().min(1),
  durationMins: z.number().int().positive(),
  workCenter: z.string().min(1),
})

const createSchema = z.object({
  productId: z.string().min(1),
  components: z.array(componentSchema).min(1, "At least one component required"),
  operations: z.array(operationSchema).optional().default([]),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const boms = await prisma.bOM.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, version: true } },
      components: { include: { product: { select: { id: true, name: true } } } },
      _count: { select: { operations: true } },
    },
  })
  return NextResponse.json(boms)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const allowedRoles = ["ADMIN", "ENGINEERING"]
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { productId, components, operations } = parsed.data

    // Get latest BOM version for this product
    const latestBOM = await prisma.bOM.findFirst({
      where: { productId },
      orderBy: { version: "desc" },
    })
    const newVersion = (latestBOM?.version ?? 0) + 1

    const bom = await prisma.bOM.create({
      data: {
        productId,
        version: newVersion,
        status: "ACTIVE",
        components: {
          create: components.map((c) => ({
            productId: c.productId,
            quantity: c.quantity,
          })),
        },
        operations: {
          create: operations.map((o) => ({
            name: o.name,
            durationMins: o.durationMins,
            workCenter: o.workCenter,
          })),
        },
      },
      include: {
        components: true,
        operations: true,
      },
    })

    return NextResponse.json(bom, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
