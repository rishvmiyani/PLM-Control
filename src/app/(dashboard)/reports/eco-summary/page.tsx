import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EcoSummaryClient from "@/components/reports/EcoSummaryClient"

export const dynamic = "force-dynamic"

export default async function EcoSummaryPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      user:    { select: { loginId: true } },
    },
  })

  const byStage = Object.entries(
    ecos.reduce((acc, e) => {
      acc[e.stage] = (acc[e.stage] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const byRisk = Object.entries(
    ecos.reduce((acc, e) => {
      acc[e.riskLevel] = (acc[e.riskLevel] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const rows = ecos.map((e) => ({
    id:          e.id,
    title:       e.title,
    stage:       e.stage,
    riskLevel:   e.riskLevel,
    riskScore:   e.riskScore,
    product:     e.product.name,
    user:        e.user.loginId,
    createdAt:   e.createdAt.toISOString(),
  }))

  return (
    <EcoSummaryClient
      rows={rows}
      byStage={byStage}
      byRisk={byRisk}
    />
  )
}
