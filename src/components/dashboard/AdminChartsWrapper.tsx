import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package, ListTree, GitPullRequest,
  AlertTriangle, CheckCircle, Users,
} from "lucide-react"
import AdminChartsWrapper from "@/components/dashboard/AdminChartsWrapper"

const STAGE_COLORS: Record<string, string> = {
  "New": "bg-[#e6c6ed]/50 text-[#8b3b9e]",
  "Engineering Review": "bg-[#be71d1]/50 text-[#8b3b9e]",
  "Approval": "bg-[#8b3b9e]/30 text-[#8b3b9e]",
  "Done": "bg-[#be71d1]/70 text-[#8b3b9e]",
  "Rejected": "bg-[#e6c6ed]/50 text-[#8b3b9e]",
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session) return null

  const [
    totalProducts,
    totalBOMs,
    openECOs,
    doneECOs,
    conflictECOs,
    highRiskECOs,
    totalUsers,
    recentECOs,
  ] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.bOM.count({ where: { status: "ACTIVE" } }),
    prisma.eCO.count({ where: { stage: { notIn: ["Done", "Rejected"] } } }),
    prisma.eCO.count({ where: { stage: "Done" } }),
    prisma.eCO.count({ where: { conflictStatus: "CONFLICT" } }),
    prisma.eCO.count({
      where: {
        riskLevel: { in: ["HIGH", "CRITICAL"] },
        stage: { notIn: ["Done", "Rejected"] },
      },
    }),
    prisma.user.count(),
    prisma.eCO.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        product: { select: { name: true, version: true } },
        user: { select: { loginId: true } },
      },
    }),
  ])

  const stats = [
    { icon: Package, label: "Active Products", value: totalProducts, color: "text-[#8b3b9e]", href: "/products", highlight: false },
    { icon: ListTree, label: "Active BOMs", value: totalBOMs, color: "text-[#be71d1]", href: "/bom", highlight: false },
    { icon: GitPullRequest, label: "Open ECOs", value: openECOs, color: "text-[#8b3b9e]", href: "/eco", highlight: false },
    { icon: CheckCircle, label: "Done ECOs", value: doneECOs, color: "text-[#be71d1]", href: "/eco", highlight: false },
    { icon: AlertTriangle, label: "Conflicts", value: conflictECOs, color: "text-[#e6c6ed]", href: "/eco", highlight: conflictECOs > 0 },
    { icon: AlertTriangle, label: "High Risk", value: highRiskECOs, color: "text-[#8b3b9e]", href: "/eco", highlight: highRiskECOs > 0 },
    { icon: Users, label: "Users", value: totalUsers, color: "text-[#be71d1]", href: "/settings/stages", highlight: false },
  ]

  const chartData = {
    openECOs,
    doneECOs,
    conflictECOs,
    highRiskECOs,
    totalProducts,
    totalBOMs,
  }

  return (
    <div className="font-['DM_Sans'] space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="glass-header">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8b3b9e] to-[#be71d1] bg-clip-text text-transparent drop-shadow-lg">
          Admin Dashboard
        </h1>
        <p className="text-[#8b3b9e]/80 text-sm md:text-base mt-1 font-medium tracking-wide">
          Platform health overview · {session.user.loginId}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <div
                className={`glass-stat-card p-6 hover:shadow-3xl transition-all duration-500 cursor-pointer group ${
                  s.highlight
                    ? "border-[#8b3b9e]/40 bg-[#8b3b9e]/5"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-7 h-7 ${s.color} group-hover:scale-110 transition-transform duration-300`} />
                  {s.highlight && (
                    <div className="w-2 h-2 bg-[#8b3b9e] rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-3xl md:text-4xl font-bold text-[#1a1a1a] group-hover:text-[#8b3b9e] transition-colors duration-300">
                  {s.value}
                </p>
                <p className="text-xs md:text-sm text-[#8b3b9e]/70 font-medium mt-1 tracking-wide group-hover:text-[#8b3b9e]/90">
                  {s.label}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Charts — using wrapper to avoid ssr:false in Server Component */}
      <AdminChartsWrapper data={chartData} />

      {/* Recent ECOs */}
      <div className="glass-card max-w-4xl">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/30">
          <h2 className="text-2xl font-bold text-[#8b3b9e] tracking-tight">Recent ECOs</h2>
          <Link href="/eco">
            <Button 
              variant="ghost" 
              size="sm" 
              className="glass-button border-[#8b3b9e]/30 text-[#8b3b9e] hover:bg-[#8b3b9e]/10 hover:border-[#8b3b9e]/50 font-medium tracking-wide"
            >
              View All →
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {recentECOs.length === 0 ? (
            <div className="glass-empty text-center py-12">
              <p className="text-lg text-[#8b3b9e]/60 font-medium">No ECOs yet</p>
            </div>
          ) : (
            recentECOs.map((eco) => (
              <Link key={eco.id} href={`/eco/${eco.id}`}>
                <div className="glass-eco-card p-6 hover:shadow-3xl transition-all duration-500 group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-[#1a1a1a] group-hover:text-[#8b3b9e] transition-colors group-hover:translate-x-1">
                        {eco.title}
                      </p>
                      <p className="text-sm text-[#8b3b9e]/70 mt-1 font-medium tracking-wide">
                        {eco.product.name} v{eco.product.version} · by {eco.user.loginId}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span
                        className={`glass-badge px-3 py-1.5 rounded-xl font-semibold text-xs shadow-lg ${
                          STAGE_COLORS[eco.stage] ?? "bg-[#e6c6ed]/50 text-[#8b3b9e]"
                        }`}
                      >
                        {eco.stage}
                      </span>
                      <Badge
                        variant={
                          ["HIGH", "CRITICAL"].includes(String(eco.riskLevel))
                            ? "destructive"
                            : "secondary"
                        }
                        className="glass-badge-border font-semibold text-xs shadow-md"
                      >
                        {String(eco.riskLevel)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}