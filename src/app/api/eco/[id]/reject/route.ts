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
    return NextResponse.json({ error: "Only APPROVER or ADMIN can reject" }, { status: 403 })

  const body   = await req.json().catch(() => ({}))
  const reason = body.reason ?? "No reason provided"

  const eco = await prisma.eCO.findUnique({ where: { id } })
  if (!eco) return NextResponse.json({ error: "ECO not found" }, { status: 404 })

  if (["Done", "Rejected"].includes(eco.stage))
    return NextResponse.json({ error: "ECO is already in terminal state" }, { status: 400 })

  const updated = await prisma.eCO.update({
    where: { id },
    data:  { stage: "Rejected", enteredStageAt: new Date() },
  })

  // ── Audit log ──
  await prisma.auditLog.create({
    data: {
      ecoId:          id,
      action:         `ECO Rejected — ${reason}`,
      affectedRecord: "ECO",
      oldValue:       eco.stage,
      newValue:       "Rejected",
      userId:         session.user.id,
    },
  })

  return NextResponse.json({ success: true, stage: updated.stage })
}
