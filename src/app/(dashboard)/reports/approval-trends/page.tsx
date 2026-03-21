import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { differenceInHours } from "date-fns"
import ApprovalTrendsClient from "@/components/reports/ApprovalTrendsClient"

export const dynamic = "force-dynamic"

export default async function ApprovalTrendsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    where: { stage: { in: ["Done", "Rejected"] } },
    include: {
      product: { select: { name: true } },
      user:    { select: { loginId: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const rows = ecos.map((e) => {
    const cycleHours = differenceInHours(
      new Date(e.updatedAt),
      new Date(e.createdAt)
    )
    return {
      id:          e.id,
      title:       e.title,
      stage:       e.stage,
      riskLevel:   e.riskLevel,
      product:     e.product.name,
      user:        e.user.loginId,
      cycleHours,
      createdAt:   e.createdAt.toISOString(),
      updatedAt:   e.updatedAt.toISOString(),
    }
  })

  // Average cycle time by risk level
  const byRisk = ["CRITICAL","HIGH","MEDIUM","LOW"].map((level) => {
    const matching = rows.filter(r => r.riskLevel === level)
    return {
      name: level,
      avgHours: matching.length
        ? Math.round(matching.reduce((s, r) => s + r.cycleHours, 0) / matching.length)
        : 0,
      count: matching.length,
    }
  }).filter(r => r.count > 0)

  // Monthly trend — count of done ECOs per month
  const monthlyMap: Record<string, { done: number; rejected: number }> = {}
  rows.forEach((r) => {
    const key = new Date(r.updatedAt).toLocaleDateString("en-IN", {
      month: "short", year: "2-digit",
    })
    if (!monthlyMap[key]) monthlyMap[key] = { done: 0, rejected: 0 }
    if (r.stage === "Done")     monthlyMap[key].done     += 1
    if (r.stage === "Rejected") monthlyMap[key].rejected += 1
  })

  const monthlyTrend = Object.entries(monthlyMap)
    .slice(-6)
    .map(([month, val]) => ({ month, ...val }))

  return (
    <ApprovalTrendsClient
      rows={rows}
      byRisk={byRisk}
      monthlyTrend={monthlyTrend}
    />
  )
}
