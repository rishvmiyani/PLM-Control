import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      boms: { orderBy: { version: "desc" } },
      ecos: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { loginId: true } } },
      },
    },
  })

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(product)
}
