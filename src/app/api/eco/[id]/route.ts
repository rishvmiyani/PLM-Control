import { NextRequest, NextResponse } from "next/server"
import { auth }   from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }  = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role
  if (!["ADMIN", "APPROVER"].includes(role))
    return NextResponse.json({ error: "Only APPROVER or ADMIN can approve" }, { status: 403 })

  const eco = await prisma.eCO.findUnique({ where: { id } })
  if (!eco) return NextResponse.json({ error: "ECO not found" }, { status: 404 })

  if (eco.stage !== "Approval")
    return NextResponse.json({
      error: `ECO must be in Approval stage. Current: ${eco.stage}`
    }, { status: 400 })

  if (eco.conflictStatus === "CONFLICT")
    return NextResponse.json({
      error: "Resolve conflicts before approving"
    }, { status: 400 })

  // ── Apply changes to product if PRODUCT type ──
  if (eco.type === "PRODUCT") {
    const changes = eco.proposedChanges as Record<string, any>

    await prisma.product.update({
      where: { id: eco.productId },
      data: {
        ...(changes.salePrice?.new !== undefined && { salePrice: changes.salePrice.new }),
        ...(changes.costPrice?.new !== undefined && { costPrice: changes.costPrice.new }),
        ...(changes.name?.new      !== undefined && { name:      changes.name.new      }),
        ...(eco.versionUpdate && { version: { increment: 1 } }),
      },
    })
  }

  // ── Move ECO to Done ──
  const updated = await prisma.eCO.update({
    where: { id },
    data:  { stage: "Done", enteredStageAt: new Date() },
  })

  // ── Audit log ──
  await prisma.auditLog.create({
    data: {
      ecoId:          id,
      action:         "ECO Approved",
      affectedRecord: "ECO",
      oldValue:       "Approval",
      newValue:       "Done",
      userId:         session.user.id,
    },
  })

  return NextResponse.json({ success: true, stage: updated.stage })
}
