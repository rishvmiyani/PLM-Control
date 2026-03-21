import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { ClipboardList, Search, CheckSquare, Package } from "lucide-react"

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
      label: "Products",
      sub: "Active BOMs",
    },
  ]

  return (
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
      </div>
    </div>
  )
}
