import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"

const STAGE_FLOW: Record<string, string> = {
  "New": "Engineering Review",
  "Engineering Review": "Approval",
  "Approval": "Done",
}

const ALLOWED_ROLES: Record<string, string[]> = {
  "New": ["ENGINEERING", "ADMIN"],
  "Engineering Review": ["ADMIN", "APPROVER"],
  "Approval": ["ADMIN", "APPROVER"],
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const eco = await prisma.eCO.findUnique({ where: { id } })
  if (!eco) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Block if conflict unresolved
  if (eco.conflictStatus === "CONFLICT") {
    return NextResponse.json(
      { error: "Resolve all conflicts before approving" },
      { status: 409 }
    )
  }

  const currentStage = eco.stage
  const nextStage = STAGE_FLOW[currentStage]

  if (!nextStage) {
    return NextResponse.json(
      { error: "ECO is already in final stage" },
      { status: 400 }
    )
  }

  const allowedRoles = ALLOWED_ROLES[currentStage] ?? []
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: `Role ${session.user.role} cannot approve at stage: ${currentStage}` },
      { status: 403 }
    )
  }

  const updated = await prisma.eCO.update({
    where: { id },
    data: {
      stage: nextStage,
      enteredStageAt: new Date(),
    },
  })

  await writeAuditLog(
    id,
    `APPROVED → ${nextStage}`,
    `ECO:${id}`,
    currentStage,
    nextStage,
    session.user.id
  )

  return NextResponse.json({ success: true, newStage: nextStage, eco: updated })
}
