import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ReportsGrid from "@/components/reports/ReportsGrid"
import {
  BarChart3, TrendingUp, AlertTriangle,
  Clock, Package, GitPullRequest,
} from "lucide-react"

export const dynamic = "force-dynamic"

const reports = [
  {
    href:        "/reports/eco-summary",
    title:       "ECO Summary",
    description: "Overview of all Engineering Change Orders by stage and type",
    icon:        "GitPullRequest",
    color:       "#8b3b9e",
    bg:          "rgba(139,59,158,0.08)",
  },
  {
    href:        "/reports/sla-breach",
    title:       "SLA Breach Report",
    description: "ECOs that have exceeded the approval SLA window",
    icon:        "Clock",
    color:       "#e07b00",
    bg:          "rgba(224,123,0,0.08)",
  },
  {
    href:        "/reports/risk-analysis",
    title:       "Risk Analysis",
    description: "Distribution of ECOs by risk level across products",
    icon:        "AlertTriangle",
    color:       "#c62828",
    bg:          "rgba(198,40,40,0.08)",
  },
  {
    href:        "/reports/product-versions",
    title:       "Product Versions",
    description: "Version history and change frequency per product",
    icon:        "Package",
    color:       "#be71d1",
    bg:          "rgba(190,113,209,0.08)",
  },
  {
    href:        "/reports/approval-trends",
    title:       "Approval Trends",
    description: "Approval cycle times and bottleneck analysis",
    icon:        "TrendingUp",
    color:       "#27ae60",
    bg:          "rgba(39,174,96,0.08)",
  },
  {
    href:        "/reports/conflict-log",
    title:       "Conflict Log",
    description: "All ECO conflicts detected and their resolution status",
    icon:        "BarChart3",
    color:       "#e63b6f",
    bg:          "rgba(230,59,111,0.08)",
  },
]

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const font = "'DM Sans', sans-serif"

  return (
    <div style={{ fontFamily: font, maxWidth: 860, padding: "0 4px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "clamp(1.4rem,4vw,1.8rem)",
          fontWeight: 800, margin: 0, lineHeight: 1.2,
          background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Reports
        </h1>
        <p style={{ color: "#9b6aab", fontSize: 13, margin: "5px 0 0", fontWeight: 500 }}>
          Analytics and insights across your PLM platform
        </p>
      </div>

      {/* Grid (client component handles hover) */}
      <ReportsGrid reports={reports} />

    </div>
  )
}
