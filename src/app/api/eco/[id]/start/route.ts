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

  const eco = await prisma.eCO.findUnique({ where: { id } })
  if (!eco) return NextResponse.json({ error: "ECO not found" }, { status: 404 })

  if (eco.stage !== "New")
    return NextResponse.json({ error: "ECO already started" }, { status: 400 })

  const updated = await prisma.eCO.update({
    where: { id },
    data:  { stage: "Engineering Review", enteredStageAt: new Date() },
  })

  return NextResponse.json({ success: true, stage: updated.stage })
}
