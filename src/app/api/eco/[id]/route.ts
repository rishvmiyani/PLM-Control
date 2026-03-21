import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateAndSaveRisk } from "@/lib/risk-engine"
import { detectConflicts } from "@/lib/conflict-engine"
import { analyzeRipple } from "@/lib/ripple-engine"
import { writeAuditLog } from "@/lib/audit"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const eco = await prisma.eCO.findUnique({
    where: { id },
    include: {
      product: true,
      bom: {
        include: {
          components: {
            include: {
              product: { select: { id: true, name: true, costPrice: true } },
            },
          },
          operations: true,
        },
      },
      user: { select: { loginId: true, role: true } },
      auditLogs: {
        orderBy: { timestamp: "asc" },
        include: { user: { select: { loginId: true } } },
      },
    },
  })

  if (!eco) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Run AI engines on every GET
  let aiRisk = { score: eco.riskScore, level: String(eco.riskLevel), reasons: [] as string[] }
  try { aiRisk = await calculateAndSaveRisk(id) } catch (e) { console.warn(e) }

  let aiConflict = { hasConflict: false, conflictingEcoIds: [] as string[], conflictingFields: [] as unknown[] }
  try { aiConflict = await detectConflicts(id) } catch (e) { console.warn(e) }

  let ripple = { affectedBOMIds: [] as string[], affectedBOMs: [] as unknown[] }
  try { ripple = await analyzeRipple(id) } catch (e) { console.warn(e) }

  const product = eco.product

  return NextResponse.json({
    ...eco,
    aiRisk,
    aiConflict,
    ripple,
    currentProductSnapshot: {
      name: product.name,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      version: product.version,
      status: String(product.status),
    },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const eco = await prisma.eCO.findUnique({ where: { id } })
  if (!eco) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updateData: Record<string, unknown> = {}

  if (body.stage !== undefined) {
    updateData.stage = body.stage
    updateData.enteredStageAt = new Date()
  }
  if (body.proposedChanges !== undefined) {
    updateData.proposedChanges = body.proposedChanges
  }
  if (body.versionUpdate !== undefined) {
    updateData.versionUpdate = body.versionUpdate
  }

  const updated = await prisma.eCO.update({
    where: { id },
    data: updateData,
  })

  await writeAuditLog(
    id,
    body.stage
      ? `STAGE_CHANGED → ${body.stage}`
      : "PROPOSED_CHANGES_UPDATED",
    `ECO:${id}`,
    body.stage ? eco.stage : null,
    body.stage ?? null,
    session.user.id
  )

  // Recalculate on proposedChanges update
  if (body.proposedChanges) {
    try { await calculateAndSaveRisk(id) } catch (e) { console.warn(e) }
    try { await detectConflicts(id) } catch (e) { console.warn(e) }
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden — Admin only" }, { status: 403 })
  }

  const { id } = await params

  const eco = await prisma.eCO.findUnique({ where: { id } })
  if (!eco) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (eco.stage === "Done") {
    return NextResponse.json(
      { error: "Cannot delete a completed ECO" },
      { status: 400 }
    )
  }

  await prisma.auditLog.deleteMany({ where: { ecoId: id } })
  await prisma.notification.deleteMany({ where: { ecoId: id } })
  await prisma.eCO.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
