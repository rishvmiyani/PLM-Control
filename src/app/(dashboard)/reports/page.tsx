import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Package, ListTree, GitPullRequest,
  Archive, TrendingUp, BarChart3,
  ArrowRight, Clock,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [totalECOs, totalBOMs, totalProducts, archivedProducts] = await Promise.all([
    prisma.eCO.count().catch(() => 0),
    prisma.bOM.count().catch(() => 0),
    prisma.product.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.product.count({ where: { status: "ARCHIVED" } }).catch(() => 0),
  ])

  const reports = [
    {
      icon: <Package style={{ width: 22, height: 22, color: "#8b3b9e" }} />,
      iconBg: "rgba(139,59,158,0.08)",
      title: "Product History",
      desc: "All product versions with price and status changes",
      href: "/reports/products",
      count: totalProducts,
      countLabel: "active products",
      countColor: "#8b3b9e",
    },
    {
      icon: <ListTree style={{ width: 22, height: 22, color: "#2196f3" }} />,
      iconBg: "rgba(33,150,243,0.08)",
      title: "BOM History",
      desc: "BOM version history per product",
      href: "/reports/boms",
      count: totalBOMs,
      countLabel: "total BOMs",
      countColor: "#2196f3",
    },
    {
      icon: <GitPullRequest style={{ width: 22, height: 22, color: "#e07b00" }} />,
      iconBg: "rgba(224,123,0,0.08)",
      title: "ECO Matrix",
      desc: "All ECOs with risk, stage and conflict status",
      href: "/reports/ecos",
      count: totalECOs,
      countLabel: "total ECOs",
      countColor: "#e07b00",
    },
    {
      icon: <Archive style={{ width: 22, height: 22, color: "#7c5f8a" }} />,
      iconBg: "rgba(124,95,138,0.08)",
      title: "Archived Items",
      desc: "All archived products and inactive BOMs",
      href: "/reports/archived",
      count: archivedProducts,
      countLabel: "archived products",
      countColor: "#7c5f8a",
    },
    {
      icon: <TrendingUp style={{ width: 22, height: 22, color: "#27ae60" }} />,
      iconBg: "rgba(39,174,96,0.08)",
      title: "Cost Analysis",
      desc: "Product cost vs sale price margin analysis",
      href: "/reports/cost",
      count: null,
      countLabel: "",
      countColor: "#27ae60",
    },
    {
      icon: <Clock style={{ width: 22, height: 22, color: "#c62828" }} />,
      iconBg: "rgba(198,40,40,0.08)",
      title: "ECO Timeline",
      desc: "Stage progression and approval timeline per ECO",
      href: "/reports/timeline",
      count: null,
      countLabel: "",
      countColor: "#c62828",
    },
  ]

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>
          Reports
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#9b6aab", margin: "4px 0 0" }}>
          View historical data and analytics
        </p>
      </div>

      {/* Summary stat strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14, marginBottom: 32,
      }}>
        {[
          { label: "Total ECOs",       value: totalECOs,         color: "#e07b00" },
          { label: "Total BOMs",        value: totalBOMs,         color: "#2196f3" },
          { label: "Active Products",   value: totalProducts,     color: "#8b3b9e" },
          { label: "Archived Products", value: archivedProducts,  color: "#7c5f8a" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(190,113,209,0.12)",
            borderRadius: 14, padding: "16px 20px",
            boxShadow: "0 2px 8px rgba(139,59,158,0.05)",
          }}>
            <p style={{
              fontSize: "1.7rem", fontWeight: 800,
              color: s.color, margin: 0, lineHeight: 1,
            }}>
              {s.value}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#9b6aab", margin: "6px 0 0", fontWeight: 500 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Report cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}>
        {reports.map((r) => (
          <Link key={r.href} href={r.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255,255,255,0.90)",
              border: "1px solid rgba(190,113,209,0.12)",
              borderRadius: 16, padding: "22px 22px 18px",
              boxShadow: "0 2px 12px rgba(139,59,158,0.05)",
              transition: "box-shadow 0.2s, transform 0.2s",
              cursor: "pointer", height: "100%",
            }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(139,59,158,0.14)"
                ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(139,59,158,0.05)"
                ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"
              }}
            >
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: r.iconBg,
                display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 14,
              }}>
                {r.icon}
              </div>

              {/* Title + desc */}
              <p style={{
                fontSize: 14, fontWeight: 700,
                color: "#2d1a38", margin: "0 0 6px",
              }}>
                {r.title}
              </p>
              <p style={{
                fontSize: 12, color: "#9b6aab",
                margin: "0 0 14px", lineHeight: 1.5,
              }}>
                {r.desc}
              </p>

              {/* Footer */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(190,113,209,0.08)",
                paddingTop: 12,
              }}>
                {r.count !== null ? (
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: r.countColor,
                  }}>
                    {r.count} {r.countLabel}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: "#c5a8d4" }}>View report</span>
                )}
                <ArrowRight style={{ width: 14, height: 14, color: "#c5a8d4" }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
