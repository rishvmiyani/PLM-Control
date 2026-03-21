import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!["ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  try {
    await prisma.$transaction(async (tx) => {
      const eco = await tx.eCO.findUnique({
        where: { id },
        include: {
          product: true,
          bom: {
            include: {
              components: true,
              operations: true,
            },
          },
        },
      })

      if (!eco) throw new Error("ECO not found")
      if (eco.conflictStatus === "CONFLICT")
        throw new Error("Resolve conflicts before applying")

      const changes = eco.proposedChanges as Record<string, unknown>

      // ── PRODUCT / ROLLBACK apply ──
      if (eco.type === "PRODUCT" || eco.type === "ROLLBACK") {
        // Archive current product
        await tx.product.update({
          where: { id: eco.productId },
          data: { status: "ARCHIVED", updatedAt: new Date() },
        })

        // Create new version
        const newProduct = await tx.product.create({
          data: {
            name: String(changes.name ?? eco.product.name),
            salePrice: Number(changes.salePrice ?? eco.product.salePrice),
            costPrice: Number(changes.costPrice ?? eco.product.costPrice),
            attachments: String(changes.attachments ?? eco.product.attachments ?? ""),
            version: eco.product.version + 1,
            status: "ACTIVE",
          },
        })

        // Point ECO to new product
        await tx.eCO.update({
          where: { id },
          data: { productId: newProduct.id },
        })

        await tx.auditLog.create({
          data: {
            ecoId: id,
            action: "VERSION_CREATED",
            affectedRecord: `Product:${newProduct.id}`,
            oldValue: `v${eco.product.version}`,
            newValue: `v${newProduct.version}`,
            userId: session.user.id,
          },
        })
      }

      // ── BOM apply ──
      if (eco.type === "BOM" && eco.bom) {
        await tx.bOM.update({
          where: { id: eco.bom.id },
          data: { status: "ARCHIVED", updatedAt: new Date() },
        })

        const newComponents = (
          changes.components as Array<{
            productId: string
            quantity: number
            action: string
          }> | undefined
        )?.filter((c) => c.action !== "REMOVE") ?? []

        const newOperations = (
          changes.operations as Array<{
            name: string
            durationMins: number
            workCenter: string
            action: string
          }> | undefined
        )?.filter((o) => o.action !== "REMOVE") ?? []

        const newBOM = await tx.bOM.create({
          data: {
            productId: eco.productId,
            version: eco.bom.version + 1,
            status: "ACTIVE",
            components: {
              create: newComponents.map((c) => ({
                productId: c.productId,
                quantity: c.quantity,
              })),
            },
            operations: {
              create: newOperations.map((o) => ({
                name: o.name,
                durationMins: o.durationMins,
                workCenter: o.workCenter,
              })),
            },
          },
        })

        await tx.auditLog.create({
          data: {
            ecoId: id,
            action: "BOM_VERSION_CREATED",
            affectedRecord: `BOM:${newBOM.id}`,
            oldValue: `v${eco.bom.version}`,
            newValue: `v${newBOM.version}`,
            userId: session.user.id,
          },
        })
      }

      // ── Mark ECO done ──
      await tx.eCO.update({
        where: { id },
        data: { stage: "Done", updatedAt: new Date() },
      })

      await tx.auditLog.create({
        data: {
          ecoId: id,
          action: "ECO_APPLIED",
          affectedRecord: `ECO:${id}`,
          oldValue: "OPEN",
          newValue: "APPLIED",
          userId: session.user.id,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Apply failed"
    console.error("ECO apply error:", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
