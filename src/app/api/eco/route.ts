import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateAndSaveRisk } from "@/lib/risk-engine"
import { detectConflicts } from "@/lib/conflict-engine"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const where =
    session.user.role === "ENGINEERING"
      ? { userId: session.user.id }
      : {}

  const ecos = await prisma.eCO.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      user: { select: { loginId: true } },
    },
  })

  return NextResponse.json(ecos)
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
    const { title, type, productId, bomId, effectiveDate, proposedChanges, versionUpdate } = body

    if (!title || !type || !productId || !effectiveDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validTypes = ["PRODUCT", "BOM", "ROLLBACK"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Step 1 — Create ECO
    const eco = await prisma.eCO.create({
      data: {
        title: String(title),
        type: type as "PRODUCT" | "BOM" | "ROLLBACK",
        productId: String(productId),
        bomId: bomId ? String(bomId) : null,
        userId: session.user.id,
        effectiveDate: new Date(effectiveDate),
        proposedChanges: proposedChanges ?? {},
        versionUpdate: versionUpdate === true,
        stage: "New",
        riskScore: 0,
        riskLevel: "LOW",
        conflictStatus: "NONE",
      },
    })

    // Step 2 — Audit log
    await prisma.auditLog.create({
      data: {
        ecoId: eco.id,
        action: "ECO_CREATED",
        affectedRecord: eco.id,
        userId: session.user.id,
      },
    })

    // Step 3 — Calculate & save risk score
    try {
      await calculateAndSaveRisk(eco.id)
    } catch (e) {
      console.warn("Risk calculation failed (non-fatal):", e)
    }

    // Step 4 — Detect conflicts
    try {
      await detectConflicts(eco.id)
    } catch (e) {
      console.warn("Conflict detection failed (non-fatal):", e)
    }

    // Step 5 — Return latest ECO with updated risk + conflict
    const updated = await prisma.eCO.findUnique({
      where: { id: eco.id },
      include: {
        product: { select: { name: true, version: true } },
        user: { select: { loginId: true } },
      },
    })

    return NextResponse.json(updated, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
