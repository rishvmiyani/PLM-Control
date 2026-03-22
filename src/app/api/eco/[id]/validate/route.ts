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
  if (!["ADMIN", "ENGINEERING"].includes(role))
    return NextResponse.json({ error: "Only ENGINEERING or ADMIN can validate" }, { status: 403 })

  const eco = await prisma.eCO.findUnique({ where: { id } })
  if (!eco) return NextResponse.json({ error: "ECO not found" }, { status: 404 })

  if (!["New", "Engineering Review"].includes(eco.stage))
    return NextResponse.json({
      error: `Cannot validate from stage: ${eco.stage}`
    }, { status: 400 })

  const updated = await prisma.eCO.update({
    where: { id },
    data:  { stage: "Approval", enteredStageAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      ecoId:          id,
      action:         "Submitted for Approval",
      affectedRecord: "ECO",
      oldValue:       eco.stage,
      newValue:       "Approval",
      userId:         session.user.id,
    },
  })

  return NextResponse.json({ success: true, stage: updated.stage })
}
