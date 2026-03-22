import { NextRequest, NextResponse } from "next/server"
import { auth }   from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const boms = await prisma.bOM.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product:    { select: { id: true, name: true, version: true } },
      components: {
        include: { product: { select: { id: true, name: true } } }
      },
      operations: true,
    },
  })
  return NextResponse.json(boms)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role
  if (!["ADMIN", "ENGINEERING"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const { productId, components, operations } = body

    if (!productId)
      return NextResponse.json({ error: "productId is required" }, { status: 400 })

    if (!components || components.length === 0)
      return NextResponse.json({ error: "At least one component is required" }, { status: 400 })

    // Get latest BOM version for this product
    const lastBOM = await prisma.bOM.findFirst({
      where:   { productId },
      orderBy: { version: "desc" },
    })
    const newVersion = (lastBOM?.version ?? 0) + 1

    // Create BOM with components and operations in one transaction
    const bom = await prisma.bOM.create({
      data: {
        productId,
        version: newVersion,
        status:  "ACTIVE",
        components: {
          create: components.map((c: { productId: string; quantity: number }) => ({
            productId: c.productId,
            quantity:  Number(c.quantity),
          })),
        },
        operations: {
          create: (operations ?? []).map((o: {
            name: string; durationMins: number; workCenter: string
          }) => ({
            name:         o.name,
            durationMins: Number(o.durationMins),
            workCenter:   o.workCenter,
          })),
        },
      },
      include: {
        components: {
          include: { product: { select: { name: true } } }
        },
        operations: true,
      },
    })

    return NextResponse.json(bom, { status: 201 })

  } catch (err: any) {
    console.error("BOM create error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
