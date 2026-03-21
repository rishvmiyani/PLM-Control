import { prisma } from "@/lib/prisma"

export interface RippleResult {
  affectedBOMIds: string[]
  affectedBOMs: Array<{
    id: string
    version: number
    productName: string
    componentProductId: string
    componentProductName: string
    quantity: number
  }>
}

export async function analyzeRipple(ecoId: string): Promise<RippleResult> {
  const eco = await prisma.eCO.findUnique({ where: { id: ecoId } })
  if (!eco) return { affectedBOMIds: [], affectedBOMs: [] }

  const proposed = eco.proposedChanges as Record<string, unknown>

  // Collect all productIds being changed
  const changedProductIds: string[] = [eco.productId]

  if (proposed.components && Array.isArray(proposed.components)) {
    for (const comp of proposed.components as Array<{ productId: string }>) {
      if (comp.productId) changedProductIds.push(comp.productId)
    }
  }

  // Find all active BOMs containing these products as components
  const affectedComponents = await prisma.component.findMany({
    where: {
      productId: { in: changedProductIds },
      bom: { status: "ACTIVE" },
    },
    include: {
      bom: {
        include: {
          product: { select: { name: true } },
        },
      },
      product: { select: { id: true, name: true } },
    },
  })

  // Exclude the ECO's own BOM
  const filtered = affectedComponents.filter(
    (c) => c.bomId !== eco.bomId
  )

  const affectedBOMIds = [...new Set(filtered.map((c) => c.bomId))]

  const affectedBOMs = filtered.map((c) => ({
    id: c.bom.id,
    version: c.bom.version,
    productName: c.bom.product.name,
    componentProductId: c.product.id,
    componentProductName: c.product.name,
    quantity: c.quantity,
  }))

  return { affectedBOMIds, affectedBOMs }
}
