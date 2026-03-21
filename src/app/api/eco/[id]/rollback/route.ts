import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 })
  }

  const { id } = await params

  const eco = await prisma.eCO.findUnique({
    where: { id },
    include: { product: true },
  })

  if (!eco) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Find previous version
  const previousProduct = await prisma.product.findFirst({
    where: {
      name: eco.product.name,
      version: eco.product.version - 1,
    },
  })

  if (!previousProduct) {
    return NextResponse.json(
      { error: "No previous version to rollback to" },
      { status: 400 }
    )
  }

  // Archive current, restore previous
  await prisma.product.update({
    where: { id: eco.productId },
    data: { status: "ARCHIVED" },
  })

  await prisma.product.update({
    where: { id: previousProduct.id },
    data: { status: "ACTIVE" },
  })

  await prisma.auditLog.create({
    data: {
      ecoId: id,
      action: "ROLLBACK_APPLIED",
      affectedRecord: eco.productId,
      oldValue: `v${eco.product.version}`,
      newValue: `v${previousProduct.version}`,
      userId: session.user.id,
    },
  })

  return NextResponse.json({ success: true, rolledBackTo: previousProduct.version })
}
