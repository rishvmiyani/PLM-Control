"use client"

import Link from "next/link"
import {
  BarChart3, TrendingUp, AlertTriangle,
  Clock, Package, GitPullRequest, ChevronRight,
} from "lucide-react"

const ICON_MAP: Record<string, React.ReactNode> = {
  GitPullRequest: <GitPullRequest style={{ width: 22, height: 22 }} />,
  Clock:          <Clock          style={{ width: 22, height: 22 }} />,
  AlertTriangle:  <AlertTriangle  style={{ width: 22, height: 22 }} />,
  Package:        <Package        style={{ width: 22, height: 22 }} />,
  TrendingUp:     <TrendingUp     style={{ width: 22, height: 22 }} />,
  BarChart3:      <BarChart3      style={{ width: 22, height: 22 }} />,
}

interface ReportCard {
  href:        string
  title:       string
  description: string
  icon:        string
  color:       string
  bg:          string
}

export default function ReportsGrid({ reports }: { reports: ReportCard[] }) {
  const font = "'DM Sans', sans-serif"

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 16,
    }}>
      {reports.map((r) => (
        <Link key={r.href} href={r.href} style={{ textDecoration: "none" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(190,113,209,0.14)",
              borderRadius: 16, padding: "20px 18px",
              boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
              cursor: "pointer", transition: "all 0.18s",
              fontFamily: font,
              display: "flex", flexDirection: "column", gap: 14,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,59,158,0.14)"
              e.currentTarget.style.borderColor = `${r.color}44`
              e.currentTarget.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(139,59,158,0.06)"
              e.currentTarget.style.borderColor = "rgba(190,113,209,0.14)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            {/* Icon + Arrow */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: r.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: r.color,
              }}>
                {ICON_MAP[r.icon]}
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: "#c0a8d0" }} />
            </div>

            {/* Text */}
            <div>
              <p style={{
                fontSize: 14, fontWeight: 800,
                color: "#2d1a38", margin: "0 0 5px",
              }}>
                {r.title}
              </p>
              <p style={{
                fontSize: 12, color: "#9b6aab",
                margin: 0, lineHeight: 1.5, fontWeight: 500,
              }}>
                {r.description}
              </p>
            </div>

            {/* Bottom tag */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              gap: 5, marginTop: "auto",
              padding: "3px 10px", borderRadius: 6,
              background: r.bg, color: r.color,
              fontSize: 10, fontWeight: 800,
              letterSpacing: "0.04em",
              alignSelf: "flex-start",
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: r.color, flexShrink: 0,
              }} />
              VIEW REPORT
            </div>

          </div>
        </Link>
      ))}
    </div>
  )
}
