import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(1, "Name required").max(255),
  salePrice: z.number().positive(),
  costPrice: z.number().positive(),
  attachments: z.array(z.string()).optional().default([]),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(products)
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

    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        salePrice: parsed.data.salePrice,
        costPrice: parsed.data.costPrice,
        attachments: parsed.data.attachments,
        version: 1,
        status: "ACTIVE",
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
