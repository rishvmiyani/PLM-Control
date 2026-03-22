"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  GitPullRequest, Clock, AlertTriangle,
  Package, TrendingUp, BarChart3,
  ChevronRight, ArrowUpRight,
} from "lucide-react"

const ICON_MAP: Record<string, React.ReactNode> = {
  GitPullRequest: <GitPullRequest style={{ width: 20, height: 20 }} />,
  Clock:          <Clock          style={{ width: 20, height: 20 }} />,
  AlertTriangle:  <AlertTriangle  style={{ width: 20, height: 20 }} />,
  Package:        <Package        style={{ width: 20, height: 20 }} />,
  TrendingUp:     <TrendingUp     style={{ width: 20, height: 20 }} />,
  BarChart3:      <BarChart3      style={{ width: 20, height: 20 }} />,
}

interface ReportCard {
  href:        string
  title:       string
  description: string
  icon:        string
  color:       string
  bg:          string
}

interface ECO {
  id:             string
  title:          string
  type:           string
  productName:    string
  stage:          string
  createdAt:      string
  enteredStageAt: string
}

interface Props {
  reports: ReportCard[]
  ecos:    ECO[]
}

const STAGES   = ["New", "Engineering Review", "Approval", "Done"]
const STAGE_COLORS: Record<string, string> = {
  "New":                "#8b3b9e",
  "Engineering Review": "#3b7abe",
  "Approval":           "#e07b00",
  "Done":               "#27ae60",
}

const SLA_HOURS: Record<string, number> = {
  "New": 24, "Engineering Review": 12, "Approval": 8,
}

const font = "'DM Sans', sans-serif"

/* ── Stat pill ── */
function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      flex: 1, textAlign: "center",
      padding: "10px 6px",
      borderRadius: 10,
      background: `rgba(${hexToRgb(color)},0.07)`,
    }}>
      <p style={{ fontSize: 20, fontWeight: 800, color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 10, color: "#9b6aab", margin: "2px 0 0", fontWeight: 500 }}>{label}</p>
    </div>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

/* ── Mini bar chart ── */
function MiniBar({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}>
      {data.map((d, i) => (
        <div key={d.label} style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 9, color: "#b0a0bc", fontWeight: 600 }}>{d.value}</span>
          <div style={{
            width: "100%",
            height: Math.max((d.value / max) * 32, 3),
            borderRadius: 4,
            background: colors[i % colors.length],
            opacity: 0.85,
          }} />
          <span style={{ fontSize: 8, color: "#b0a0bc", textAlign: "center", lineHeight: 1.1 }}>
            {d.label.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Donut chart (SVG) ── */
function Donut({ data, colors }: { data: number[]; colors: string[] }) {
  const total = data.reduce((a, b) => a + b, 0) || 1
  const r = 22, cx = 28, cy = 28, stroke = 10
  let offset = 0
  const circ = 2 * Math.PI * r

  return (
    <svg width={56} height={56}>
      {data.map((val, i) => {
        const pct  = val / total
        const dash = pct * circ
        const gap  = circ - dash
        const rotate = offset * 360 - 90
        offset += pct
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rotate} ${cx} ${cy})`}
            opacity={0.85}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 1} fill="#f8f4fc" />
    </svg>
  )
}

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */
export default function ReportsGrid({ reports, ecos }: Props) {

  /* ── Derived stats ── */
  const stageCounts = useMemo(() =>
    STAGES.map(s => ({ label: s, value: ecos.filter(e => e.stage === s).length })),
    [ecos]
  )

  const breachedCount = useMemo(() => ecos.filter(e => {
    const hrs = SLA_HOURS[e.stage]
    if (!hrs) return false
    const elapsed = (Date.now() - new Date(e.enteredStageAt).getTime()) / 36e5
    return elapsed > hrs
  }).length, [ecos])

  // type distribution
  const typeMap = useMemo(() => {
    const m: Record<string, number> = {}
    ecos.forEach(e => { m[e.type] = (m[e.type] ?? 0) + 1 })
    return m
  }, [ecos])
  const typeEntries = Object.entries(typeMap).slice(0, 5)

  // product frequency
  const prodMap = useMemo(() => {
    const m: Record<string, number> = {}
    ecos.forEach(e => { m[e.productName] = (m[e.productName] ?? 0) + 1 })
    return Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0, 5)
  }, [ecos])

  // monthly trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { label: string; value: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleString("en", { month: "short" })
      const value = ecos.filter(e => {
        const ec = new Date(e.createdAt)
        return ec.getMonth() === d.getMonth() && ec.getFullYear() === d.getFullYear()
      }).length
      months.push({ label, value })
    }
    return months
  }, [ecos])

  // conflict proxy: type === "Design Change" = conflict risk
  const conflictCount = useMemo(() =>
    ecos.filter(e => e.type === "Design Change").length,
    [ecos]
  )

  /* ── Widget content per card ── */
  const widgets: Record<string, React.ReactNode> = {
    "/reports/eco-summary": (
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <Stat label="Total"    value={ecos.length}                       color="#8b3b9e" />
          <Stat label="Done"     value={stageCounts.find(s=>s.label==="Done")?.value ?? 0} color="#27ae60" />
          <Stat label="In Flow"  value={ecos.length - (stageCounts.find(s=>s.label==="Done")?.value ?? 0)} color="#3b7abe" />
        </div>
        <MiniBar data={stageCounts} colors={STAGES.map(s => STAGE_COLORS[s])} />
      </div>
    ),
    "/reports/sla-breach": (
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <Stat label="Breached" value={breachedCount}              color="#c62828" />
          <Stat label="On Track" value={ecos.length - breachedCount} color="#27ae60" />
        </div>
        <MiniBar
          data={STAGES.slice(0,3).map(s => {
            const stageEcos = ecos.filter(e => e.stage === s)
            const breached  = stageEcos.filter(e => {
              const hrs     = SLA_HOURS[s]
              const elapsed = (Date.now() - new Date(e.enteredStageAt).getTime()) / 36e5
              return elapsed > hrs
            }).length
            return { label: s, value: breached }
          })}
          colors={["#c62828","#e07b00","#e63b6f"]}
        />
      </div>
    ),
    "/reports/risk-analysis": (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Donut
          data={typeEntries.map(([,v]) => v)}
          colors={["#8b3b9e","#e07b00","#c62828","#27ae60","#3b7abe"]}
        />
        <div style={{ flex: 1 }}>
          {typeEntries.map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "#6b4d7a", fontWeight: 600 }}>{k}</span>
              <span style={{ fontSize: 10, fontWeight: 800,
                color: ["#8b3b9e","#e07b00","#c62828","#27ae60","#3b7abe"][i % 5] }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    "/reports/product-versions": (
      <div>
        {prodMap.slice(0,4).map(([name, count]) => (
          <div key={name} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: "#6b4d7a", fontWeight: 600 }}>{name}</span>
              <span style={{ fontSize: 10, color: "#be71d1", fontWeight: 800 }}>{count}</span>
            </div>
            <div style={{ height: 4, borderRadius: 4, background: "rgba(190,113,209,0.12)" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: "linear-gradient(90deg,#8b3b9e,#be71d1)",
                width: `${Math.round((count / (prodMap[0]?.[1] ?? 1)) * 100)}%`,
              }} />
            </div>
          </div>
        ))}
      </div>
    ),
    "/reports/approval-trends": (
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <Stat label="This Month" value={monthlyData[monthlyData.length-1]?.value ?? 0} color="#27ae60" />
          <Stat label="Last Month"  value={monthlyData[monthlyData.length-2]?.value ?? 0} color="#3b7abe" />
        </div>
        <MiniBar data={monthlyData} colors={["#27ae60","#3b7abe","#8b3b9e","#e07b00","#be71d1","#27ae60"]} />
      </div>
    ),
    "/reports/conflict-log": (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Donut
          data={[conflictCount, Math.max(ecos.length - conflictCount, 0)]}
          colors={["#e63b6f","rgba(230,59,111,0.15)"]}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <Stat label="Conflicts"  value={conflictCount}              color="#e63b6f" />
            <Stat label="Clean"      value={ecos.length - conflictCount} color="#27ae60" />
          </div>
        </div>
      </div>
    ),
  }

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
      gap:                 18,
      fontFamily:          font,
    }}>
      {reports.map((r) => (
        <Link key={r.href} href={r.href} style={{ textDecoration: "none" }}>
          <div
            style={{
              background:   "#fff",
              border:       "1px solid rgba(190,113,209,0.16)",
              borderRadius: 16,
              padding:      "18px 18px 14px",
              boxShadow:    "0 2px 12px rgba(139,59,158,0.07)",
              cursor:       "pointer",
              transition:   "box-shadow 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,59,158,0.14)"
              e.currentTarget.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(139,59,158,0.07)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: r.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: r.color,
                }}>
                  {ICON_MAP[r.icon]}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
                    {r.title}
                  </p>
                  <p style={{ fontSize: 10, color: "#b0a0bc", margin: "2px 0 0", lineHeight: 1.4 }}>
                    {r.description}
                  </p>
                </div>
              </div>
              <ArrowUpRight style={{ width: 14, height: 14, color: "#c0a8d0", flexShrink: 0, marginTop: 2 }} />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(190,113,209,0.10)", marginBottom: 12 }} />

            {/* Widget */}
            <div>
              {widgets[r.href] ?? (
                <p style={{ fontSize: 11, color: "#b0a0bc", margin: 0 }}>No preview available</p>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: "flex", justifyContent: "flex-end",
              marginTop: 12, alignItems: "center", gap: 4,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: r.color }}>View Report</span>
              <ChevronRight style={{ width: 11, height: 11, color: r.color }} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
