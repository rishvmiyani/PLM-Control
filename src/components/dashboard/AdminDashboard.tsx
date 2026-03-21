import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  ListTree,
  GitPullRequest,
  AlertTriangle,
  CheckCircle,
  Users,
} from "lucide-react"
import AdminChartsWrapper from "@/components/dashboard/AdminChartsWrapper"

const STAGE_COLORS: Record<string, string> = {
  "New": "bg-[#e6c6ed]/60 backdrop-blur-sm text-[#8b3b9e]",
  "Engineering Review": "bg-[#be71d1]/50 backdrop-blur-sm text-[#8b3b9e]",
  "Approval": "bg-[#8b3b9e]/30 backdrop-blur-sm text-[#8b3b9e]",
  "Done": "bg-[#be71d1]/70 backdrop-blur-sm text-[#8b3b9e]",
  "Rejected": "bg-[#e6c6ed]/50 backdrop-blur-sm text-[#8b3b9e]",
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
    {
      icon: Package,
      label: "Active Products",
      value: totalProducts,
      color: "text-[#8b3b9e]",
      href: "/products",
      highlight: false,
    },
    {
      icon: ListTree,
      label: "Active BOMs",
      value: totalBOMs,
      color: "text-[#be71d1]",
      href: "/bom",
      highlight: false,
    },
    {
      icon: GitPullRequest,
      label: "Open ECOs",
      value: openECOs,
      color: "text-[#8b3b9e]",
      href: "/eco",
      highlight: false,
    },
    {
      icon: CheckCircle,
      label: "Done ECOs",
      value: doneECOs,
      color: "text-[#be71d1]",
      href: "/eco",
      highlight: false,
    },
    {
      icon: AlertTriangle,
      label: "Conflicts",
      value: conflictECOs,
      color: "text-[#e6c6ed]",
      href: "/eco",
      highlight: conflictECOs > 0,
    },
    {
      icon: AlertTriangle,
      label: "High Risk",
      value: highRiskECOs,
      color: "text-[#8b3b9e]",
      href: "/eco",
      highlight: highRiskECOs > 0,
    },
    {
      icon: Users,
      label: "Users",
      value: totalUsers,
      color: "text-[#be71d1]",
      href: "/settings/stages",
      highlight: false,
    },
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
    <div className="font-['DM_Sans'] space-y-8 p-6 lg:p-12">
      {/* Header */}
      <div className="glass-header">
        <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#8b3b9e] via-[#be71d1] to-[#8b3b9e] bg-clip-text text-transparent drop-shadow-2xl">
          Admin Dashboard
        </h1>
        <p className="text-[#8b3b9e]/80 text-lg mt-2 font-semibold tracking-wide">
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
                className={`glass-stat p-8 rounded-3xl cursor-pointer group hover:-translate-y-3 transition-all duration-500 hover:shadow-3xl ${
                  s.highlight
                    ? "ring-2 ring-[#8b3b9e]/30 bg-gradient-to-br from-[#8b3b9e]/5 to-[#be71d1]/5 border-[#8b3b9e]/40"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-10 h-10 ${s.color} group-hover:scale-110 transition-all duration-300 drop-shadow-lg`} />
                  {s.highlight && (
                    <div className="w-3 h-3 bg-gradient-to-r from-[#8b3b9e] to-[#be71d1] rounded-full animate-pulse shadow-lg" />
                  )}
                </div>
                <p className="text-4xl lg:text-5xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-all duration-300 drop-shadow-md">
                  {s.value}
                </p>
                <p className="text-sm lg:text-base text-[#8b3b9e]/70 font-semibold mt-2 tracking-wide group-hover:text-[#8b3b9e]/90">
                  {s.label}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Charts via wrapper */}
      <AdminChartsWrapper data={chartData} />

      {/* Recent ECOs */}
      <div className="glass-card max-w-6xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 pb-8 border-b border-white/30">
          <h2 className="text-3xl font-black text-[#8b3b9e] tracking-tight drop-shadow-lg mb-4 lg:mb-0">
            Recent ECOs
          </h2>
          <Link href="/eco">
            <Button 
              variant="ghost" 
              size="lg" 
              className="glass-button px-8 py-3 font-semibold tracking-wide border-2 hover:bg-[#8b3b9e]/20"
            >
              View All →
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {recentECOs.length === 0 ? (
            <div className="glass-empty-state text-center py-16 px-8">
              <p className="text-2xl font-semibold text-[#8b3b9e]/60 tracking-wide">
                No ECOs yet
              </p>
              <p className="text-lg text-[#8b3b9e]/40 mt-2 font-medium">
                Get started by creating your first ECO
              </p>
            </div>
          ) : (
            recentECOs.map((eco) => (
              <Link key={eco.id} href={`/eco/${eco.id}`}>
                <div className="glass-eco-item p-8 rounded-2xl hover:shadow-4xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-xl lg:text-2xl font-bold text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-all duration-300 drop-shadow-lg line-clamp-1">
                        {eco.title}
                      </p>
                      <p className="text-base lg:text-lg text-[#8b3b9e]/80 mt-2 font-semibold tracking-wide">
                        {eco.product.name} v{eco.product.version} · by {eco.user.loginId}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className={`glass-stage-badge px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transform hover:scale-105 transition-all duration-200 ${
                          STAGE_COLORS[eco.stage] ?? "bg-[#e6c6ed]/60 backdrop-blur-sm text-[#8b3b9e]"
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
                        className="glass-badge-lg px-4 py-2 font-bold text-base shadow-xl border-2"
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