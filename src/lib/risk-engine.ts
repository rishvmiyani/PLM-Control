import { prisma } from "@/lib/prisma"

interface RiskResult {
  score: number
  level: string
  reasons: string[]
}

export async function calculateAndSaveRisk(ecoId: string): Promise<RiskResult> {
  const eco = await prisma.eCO.findUnique({
    where: { id: ecoId },
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

  const changes = eco.proposedChanges as Record<string, unknown>
  let score = 0
  const reasons: string[] = []

  // Price change risk
  if (changes.salePrice && eco.product.salePrice) {
    const pct =
      Math.abs(
        ((Number(changes.salePrice) - eco.product.salePrice) /
          eco.product.salePrice) *
          100
      )
    if (pct > 20) {
      score += 30
      reasons.push(`Sale price change of ${pct.toFixed(1)}% exceeds 20% threshold`)
    } else if (pct > 10) {
      score += 15
      reasons.push(`Sale price change of ${pct.toFixed(1)}%`)
    }
  }

  if (changes.costPrice && eco.product.costPrice) {
    const pct =
      Math.abs(
        ((Number(changes.costPrice) - eco.product.costPrice) /
          eco.product.costPrice) *
          100
      )
    if (pct > 15) {
      score += 25
      reasons.push(`Cost price change of ${pct.toFixed(1)}% exceeds 15% threshold`)
    } else if (pct > 5) {
      score += 10
      reasons.push(`Cost price change of ${pct.toFixed(1)}%`)
    }
  }

  // BOM component change risk
  if (eco.type === "BOM" && eco.bom) {
    const components = changes.components as Array<{
      action: string
    }> | undefined

    const removals = components?.filter((c) => c.action === "REMOVE").length ?? 0
    const additions = components?.filter((c) => c.action === "ADD").length ?? 0
    const modifications = components?.filter((c) => c.action === "MODIFY").length ?? 0

    if (removals > 0) {
      score += removals * 15
      reasons.push(`${removals} component(s) being removed`)
    }
    if (additions > 0) {
      score += additions * 10
      reasons.push(`${additions} new component(s) being added`)
    }
    if (modifications > 0) {
      score += modifications * 8
      reasons.push(`${modifications} component(s) being modified`)
    }
  }

  // Rollback risk
  if (eco.type === "ROLLBACK") {
    score += 20
    reasons.push("Rollback ECOs carry inherent medium risk")
  }

  // Version bump risk
  if (eco.versionUpdate) {
    score += 5
    reasons.push("Version bump will archive current product")
  }

  score = Math.min(score, 100)

  const level =
    score >= 75 ? "CRITICAL" :
    score >= 50 ? "HIGH" :
    score >= 25 ? "MEDIUM" : "LOW"

  await prisma.eCO.update({
    where: { id: ecoId },
    data: { riskScore: score, riskLevel: level },
  })

  return { score, level, reasons }
}
