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

  const bom = await prisma.bOM.findUnique({
    where: { id },
    include: {
      product: true,
      components: {
        include: {
          product: { select: { id: true, name: true, version: true, salePrice: true, costPrice: true } },
        },
      },
      operations: true,
      ecos: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { loginId: true } } },
      },
    },
  })

  if (!bom) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(bom)
}
