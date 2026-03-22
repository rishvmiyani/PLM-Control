import { NextRequest, NextResponse } from "next/server"
import { auth }   from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ecos = await prisma.eCO.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      user:    { select: { loginId: true } },
    },
  })
  return NextResponse.json(ecos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { title, type, productId, bomId, effectiveDate, versionUpdate, proposedChanges } = body

    if (!title || !type || !productId || !effectiveDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // type must match enum: PRODUCT | BOM | ROLLBACK
    const validTypes = ["PRODUCT", "BOM", "ROLLBACK"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 })
    }

    const firstStage = await prisma.eCOStage.findFirst({ orderBy: { order: "asc" } })
    const stageName  = firstStage?.name ?? "New"

    const eco = await prisma.eCO.create({
      data: {
        title,
        type,            // ECOType enum: PRODUCT | BOM | ROLLBACK
        productId,
        bomId:           bomId || null,
        userId:          session.user.id,
        effectiveDate:   new Date(effectiveDate),
        versionUpdate:   versionUpdate ?? false,
        proposedChanges: proposedChanges ?? {},
        stage:           stageName,
        enteredStageAt:  new Date(),
        riskScore:       0,
        riskLevel:       "LOW",
        conflictStatus:  "NONE",
      },
    })

    return NextResponse.json(eco, { status: 201 })

  } catch (err: any) {
    console.error("ECO create error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
