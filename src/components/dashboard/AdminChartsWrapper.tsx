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
  "New": "bg-zinc-100 text-zinc-700",
  "Engineering Review": "bg-blue-100 text-blue-700",
  "Approval": "bg-yellow-100 text-yellow-700",
  "Done": "bg-green-100 text-green-700",
  "Rejected": "bg-red-100 text-red-700",
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
    { icon: Package, label: "Active Products", value: totalProducts, color: "text-blue-500", href: "/products", highlight: false },
    { icon: ListTree, label: "Active BOMs", value: totalBOMs, color: "text-purple-500", href: "/bom", highlight: false },
    { icon: GitPullRequest, label: "Open ECOs", value: openECOs, color: "text-orange-500", href: "/eco", highlight: false },
    { icon: CheckCircle, label: "Done ECOs", value: doneECOs, color: "text-green-500", href: "/eco", highlight: false },
    { icon: AlertTriangle, label: "Conflicts", value: conflictECOs, color: "text-red-500", href: "/eco", highlight: conflictECOs > 0 },
    { icon: AlertTriangle, label: "High Risk", value: highRiskECOs, color: "text-orange-500", href: "/eco", highlight: highRiskECOs > 0 },
    { icon: Users, label: "Users", value: totalUsers, color: "text-zinc-400", href: "/settings/stages", highlight: false },
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Platform health overview · {session.user.loginId}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <div
                className={`rounded-xl border p-4 hover:shadow-sm transition-shadow cursor-pointer ${
                  s.highlight
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-zinc-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Charts — using wrapper to avoid ssr:false in Server Component */}
      <AdminChartsWrapper data={chartData} />

      {/* Recent ECOs */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-800">Recent ECOs</h2>
          <Link href="/eco">
            <Button variant="ghost" size="sm">View All →</Button>
          </Link>
        </div>
        <div className="space-y-2">
          {recentECOs.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-6">No ECOs yet</p>
          ) : (
            recentECOs.map((eco) => (
              <Link key={eco.id} href={`/eco/${eco.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{eco.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {eco.product.name} v{eco.product.version} · by {eco.user.loginId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        STAGE_COLORS[eco.stage] ?? "bg-zinc-100 text-zinc-600"
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
                    >
                      {String(eco.riskLevel)}
                    </Badge>
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
