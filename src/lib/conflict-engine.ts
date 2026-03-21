import { prisma } from "@/lib/prisma"

interface ConflictResult {
  hasConflict: boolean
  conflictingEcoIds: string[]
  conflictingFields: Array<{
    field: string
    thisValue: unknown
    otherValue: unknown
    otherEcoId: string
  }>
}

const CONFLICT_FIELDS = ["salePrice", "costPrice", "name"]

export async function detectConflicts(ecoId: string): Promise<ConflictResult> {
  const eco = await prisma.eCO.findUnique({ where: { id: ecoId } })
  if (!eco) throw new Error("ECO not found")

  const thisChanges = eco.proposedChanges as Record<string, unknown>

  // Find other open ECOs on same product
  const otherECOs = await prisma.eCO.findMany({
    where: {
      productId: eco.productId,
      id: { not: ecoId },
      stage: { notIn: ["Done", "Rejected"] },
    },
  })

  const conflictingFields: ConflictResult["conflictingFields"] = []
  const conflictingEcoIds: string[] = []

  for (const other of otherECOs) {
    const otherChanges = other.proposedChanges as Record<string, unknown>

    for (const field of CONFLICT_FIELDS) {
      if (
        thisChanges[field] !== undefined &&
        otherChanges[field] !== undefined &&
        thisChanges[field] !== otherChanges[field]
      ) {
        conflictingFields.push({
          field,
          thisValue: thisChanges[field],
          otherValue: otherChanges[field],
          otherEcoId: other.id,
        })
        if (!conflictingEcoIds.includes(other.id)) {
          conflictingEcoIds.push(other.id)
        }
      }
    }
  }

  const hasConflict = conflictingFields.length > 0

  await prisma.eCO.update({
    where: { id: ecoId },
    data: { conflictStatus: hasConflict ? "CONFLICT" : "NONE" },
  })

  return { hasConflict, conflictingEcoIds, conflictingFields }
}
