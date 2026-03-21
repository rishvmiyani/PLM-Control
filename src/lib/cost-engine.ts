import { prisma } from "@/lib/prisma"

export interface CostDeltaInput {
  components: Array<{
    productId: string
    originalQty: number
    newQty: number
  }>
}

export interface CostDeltaResult {
  beforeCost: number
  afterCost: number
  delta: number
  deltaPercent: number
}

export async function calculateCostDelta(
  input: CostDeltaInput
): Promise<CostDeltaResult> {
  const productIds = input.components.map((c) => c.productId)

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, costPrice: true },
  })

  const priceMap = new Map(products.map((p) => [p.id, p.costPrice]))

  let beforeCost = 0
  let afterCost = 0

  for (const c of input.components) {
    const price = priceMap.get(c.productId) ?? 0
    beforeCost += price * c.originalQty
    afterCost += price * c.newQty
  }

  const delta = afterCost - beforeCost
  const deltaPercent = beforeCost !== 0 ? (delta / beforeCost) * 100 : 0

  return { beforeCost, afterCost, delta, deltaPercent }
}
