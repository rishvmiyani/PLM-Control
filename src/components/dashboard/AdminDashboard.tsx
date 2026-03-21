import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { ClipboardList, Search, CheckSquare, Package } from "lucide-react"

<<<<<<< HEAD
const STAGE_COLORS: Record<string, string> = {
  "New": "bg-[#e6c6ed]/60 backdrop-blur-sm text-[#8b3b9e]",
  "Engineering Review": "bg-[#be71d1]/50 backdrop-blur-sm text-[#8b3b9e]",
  "Approval": "bg-[#8b3b9e]/30 backdrop-blur-sm text-[#8b3b9e]",
  "Done": "bg-[#be71d1]/70 backdrop-blur-sm text-[#8b3b9e]",
  "Rejected": "bg-[#e6c6ed]/50 backdrop-blur-sm text-[#8b3b9e]",
=======
const STAGE_BADGE: Record<string, string> = {
  "New": "badge-draft",
  "Engineering Review": "badge-review",
  "Approval": "badge-review",
  "Done": "badge-approved",
  "Rejected": "badge-rejected",
}

const RISK_CLASS: Record<string, string> = {
  LOW: "priority-low",
  MEDIUM: "priority-medium",
  HIGH: "priority-high",
  CRITICAL: "priority-high",
>>>>>>> beed07c (add new files and updates)
}

export default async function AdminDashboard() {
  const session = await auth()

  const [totalECOs, inReview, approved, totalProducts, recentECOs] =
    await Promise.all([
      prisma.eCO.count().catch(() => 0),
      prisma.eCO.count({ where: { stage: "Engineering Review" } }).catch(() => 0),
      prisma.eCO.count({ where: { stage: "Done" } }).catch(() => 0),
      prisma.product.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.eCO.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          product: { select: { name: true, version: true } },
          user: { select: { loginId: true } },
        },
      }).catch(() => []),
    ])

  const stats = [
    {
      icon: <ClipboardList style={{ width: 28, height: 28, color: "#8b3b9e", opacity: 0.8 }} />,
      value: totalECOs,
      label: "Total ECOs",
      sub: "+3 this week",
    },
    {
      icon: <Search style={{ width: 28, height: 28, color: "#2196f3", opacity: 0.8 }} />,
      value: inReview,
      label: "In Review",
      sub: "2 pending >48h",
    },
    {
      icon: <CheckSquare style={{ width: 28, height: 28, color: "#4caf50", opacity: 0.8 }} />,
      value: approved,
      label: "Approved",
      sub: "+2 today",
    },
    {
      icon: <Package style={{ width: 28, height: 28, color: "#ff9800", opacity: 0.8 }} />,
      value: totalProducts,
<<<<<<< HEAD
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
=======
      label: "Products",
      sub: "Active BOMs",
>>>>>>> beed07c (add new files and updates)
    },
  ]

  return (
<<<<<<< HEAD
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
=======
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#9b6aab", marginTop: 4 }}>
          Overview of your Engineering Change Orders
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 32,
      }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ marginBottom: 12 }}>{s.icon}</div>
            <p style={{ fontSize: "1.9rem", fontWeight: 800, color: "#2d1a38", margin: 0 }}>
              {s.value}
            </p>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3b1a47", margin: "4px 0 2px" }}>
              {s.label}
            </p>
            <p style={{ fontSize: "0.78rem", color: "#9b6aab", margin: 0 }}>
              {s.sub}
            </p>
          </div>
        ))}
>>>>>>> beed07c (add new files and updates)
      </div>

      {/* Manufacturing orders table */}
      <div style={{
        background: "rgba(255,255,255,0.90)",
        border: "1px solid rgba(190,113,209,0.12)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(190,113,209,0.08)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>
            Manufacturing Orders
          </h2>
        </div>

<<<<<<< HEAD
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
=======
        <table style={{ width: "100%", borderCollapse: "collapse" }} className="eco-table">
          <thead>
            <tr style={{ background: "#faf6fd" }}>
              {["ECO ID", "TITLE", "PRODUCT", "STATUS", "PRIORITY", "DATE", "OWNER"].map((h) => (
                <th key={h} style={{
                  padding: "10px 20px", textAlign: "left",
                  fontSize: 11, fontWeight: 700,
                  color: "#9b6aab", letterSpacing: "0.07em",
                  borderBottom: "1px solid rgba(190,113,209,0.08)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentECOs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#9b6aab", fontSize: 13 }}>
                  No ECOs found. Run seed to add data.
                </td>
              </tr>
            ) : (
              recentECOs.map((eco, idx) => {
                const ecoId = `ECO-${String(idx + 37).padStart(4, "0")}`
                return (
                  <tr key={eco.id} style={{ borderBottom: "1px solid rgba(190,113,209,0.06)" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <Link href={`/eco/${eco.id}`} style={{
                        fontSize: 13, fontWeight: 600,
                        color: "#8b3b9e", textDecoration: "none",
                      }}>
                        {ecoId}
                      </Link>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#2d1a38" }}>
                      {eco.title}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#7c5f8a" }}>
                      {eco.product.name} v{eco.product.version}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        className={`badge ${STAGE_BADGE[eco.stage] ?? "badge-draft"}`}
                        style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999 }}
                      >
                        {eco.stage}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span className={RISK_CLASS[String(eco.riskLevel)] ?? "priority-medium"} style={{ fontSize: 13 }}>
                        {String(eco.riskLevel).charAt(0) + String(eco.riskLevel).slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#7c5f8a" }}>
                      {new Date(eco.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 11, fontWeight: 700,
                      }}>
                        {eco.user.loginId.slice(0, 2).toUpperCase()}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
>>>>>>> beed07c (add new files and updates)
      </div>
    </div>
  )
}