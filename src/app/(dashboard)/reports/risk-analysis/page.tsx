
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RiskAnalysisClient from "@/components/reports/RiskAnalysisClient"

export const dynamic = "force-dynamic"

export default async function RiskAnalysisPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    include: {
      product: { select: { name: true } },
      user:    { select: { loginId: true } },
    },
    orderBy: { riskScore: "desc" },
  })

  const byRisk = ["CRITICAL","HIGH","MEDIUM","LOW"].map((level) => ({
    name:  level,
    value: ecos.filter(e => e.riskLevel === level).length,
    avg:   Math.round(
      ecos.filter(e => e.riskLevel === level)
          .reduce((s, e) => s + e.riskScore, 0) /
      (ecos.filter(e => e.riskLevel === level).length || 1)
    ),
  }))

  const rows = ecos.map((e) => ({
    id: e.id, title: e.title,
    riskLevel: e.riskLevel, riskScore: e.riskScore,
    stage: e.stage, product: e.product.name,
    user: e.user.loginId, createdAt: e.createdAt.toISOString(),
  }))

  return <RiskAnalysisClient rows={rows} byRisk={byRisk} />
}
