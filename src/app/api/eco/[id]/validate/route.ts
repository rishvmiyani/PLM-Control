import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"
import { calculateAndSaveRisk } from "@/lib/risk-engine"
import { detectConflicts } from "@/lib/conflict-engine"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const allowedRoles = ["ADMIN", "ENGINEERING"]
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const eco = await prisma.eCO.findUnique({ where: { id } })
  if (!eco) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Block if conflict
  if (eco.conflictStatus === "CONFLICT") {
    return NextResponse.json(
      { error: "Resolve conflicts before validating" },
      { status: 409 }
    )
  }

  // Block if not in Engineering Review
  if (eco.stage !== "Engineering Review") {
    return NextResponse.json(
      { error: "Can only validate ECOs in Engineering Review stage" },
      { status: 400 }
    )
  }

  // Re-run risk + conflict before validating
  let riskResult
  try {
    riskResult = await calculateAndSaveRisk(id)
  } catch (e) {
    console.warn("Risk calc failed during validate:", e)
  }

  let conflictResult
  try {
    conflictResult = await detectConflicts(id)
    if (conflictResult.hasConflict) {
      return NextResponse.json(
        { error: "New conflict detected during validation. Resolve before proceeding." },
        { status: 409 }
      )
    }
  } catch (e) {
    console.warn("Conflict check failed during validate:", e)
  }

  // Move to Approval stage
  const updated = await prisma.eCO.update({
    where: { id },
    data: {
      stage: "Approval",
      enteredStageAt: new Date(),
    },
  })

  await writeAuditLog(
    id,
    "VALIDATED → Approval",
    `ECO:${id}`,
    "Engineering Review",
    "Approval",
    session.user.id
  )

  return NextResponse.json({
    success: true,
    newStage: "Approval",
    eco: updated,
    risk: riskResult,
    conflicts: conflictResult,
  })
}
