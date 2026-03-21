"use client"

import ReportShell from "./ReportShell"
import { format } from "date-fns"
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts"

interface Row {
  id: string; title: string; stage: string; riskLevel: string
  product: string; user: string; hoursElapsed: number
  isBreached: boolean; enteredStageAt: string
}

const RISK_COLORS: Record<string, string> = {
  LOW: "#27ae60", MEDIUM: "#8b3b9e", HIGH: "#e07b00", CRITICAL: "#c62828",
}

function exportPDF(rows: Row[], slaHours: number) {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(({ default: autoTable }) => {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("SLA Breach Report", 14, 18)
      doc.setFontSize(10)
      doc.text(`SLA Threshold: ${slaHours}h | Generated: ${new Date().toLocaleString()}`, 14, 26)
      autoTable(doc, {
        startY: 32,
        head: [["Title", "Product", "Stage", "Risk", "Hours Elapsed", "Status"]],
        body: rows.map((r) => [
          r.title, r.product, r.stage, r.riskLevel,
          `${r.hoursElapsed}h`,
          r.isBreached ? "BREACHED" : "OK",
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [224, 123, 0] },
      })
      doc.save("sla-breach-report.pdf")
    })
  })
}

export default function SLABreachClient({
  rows, slaHours,
}: { rows: Row[]; slaHours: number }) {
  const breached = rows.filter(r => r.isBreached)
  const atRisk   = rows.filter(r => !r.isBreached && r.hoursElapsed >= slaHours - 1)
  const safe     = rows.filter(r => !r.isBreached && r.hoursElapsed < slaHours - 1)

  const font = "'DM Sans', sans-serif"

  return (
    <ReportShell
      title="SLA Breach Report"
      description={`ECOs exceeding the ${slaHours}-hour approval window`}
      onExport={() => exportPDF(rows, slaHours)}
    >
      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: 12, marginBottom: 22,
      }}>
        {[
          { label: "Breached",  value: breached.length, color: "#c62828", bg: "rgba(198,40,40,0.07)" },
          { label: "At Risk",   value: atRisk.length,   color: "#e07b00", bg: "rgba(224,123,0,0.07)" },
          { label: "Safe",      value: safe.length,     color: "#27ae60", bg: "rgba(39,174,96,0.07)" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: bg, border: `1px solid ${color}30`,
            borderRadius: 14, padding: "20px 16px", textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <p style={{ fontSize: 30, fontWeight: 800, color, margin: 0 }}>{value}</p>
            <p style={{ fontSize: 11, color, margin: "4px 0 0", fontWeight: 700 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart — hours elapsed per ECO */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16, padding: "18px", marginBottom: 22,
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: "0 0 14px" }}>
          Hours in Current Stage
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rows.slice(0, 20)} margin={{ left: -10 }}>
            <XAxis dataKey="title" tick={{ fontSize: 9 }}
              tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + "…" : v} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => [`${v}h`, "Elapsed"]} />
            <ReferenceLine y={slaHours} stroke="#e07b00"
              strokeDasharray="4 2" label={{ value: "SLA", fontSize: 10, fill: "#e07b00" }} />
            <Bar dataKey="hoursElapsed" radius={[6,6,0,0]}>
              {rows.slice(0, 20).map((r) => (
                <Cell key={r.id} fill={r.isBreached ? "#c62828" : "#27ae60"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(190,113,209,0.10)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            All Open ECOs — SLA Status ({rows.length})
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 110px 80px 90px 80px",
          padding: "7px 18px",
          background: "rgba(245,240,252,0.5)",
          borderBottom: "1px solid rgba(190,113,209,0.08)",
        }}>
          {["TITLE","PRODUCT","STAGE","RISK","ELAPSED","STATUS"].map(col => (
            <span key={col} style={{ fontSize: 10, fontWeight: 800, color: "#9b6aab", letterSpacing: "0.06em" }}>
              {col}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={r.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 110px 80px 90px 80px",
            padding: "11px 18px", alignItems: "center",
            borderBottom: i < rows.length - 1 ? "1px solid rgba(190,113,209,0.07)" : "none",
            background: r.isBreached ? "rgba(198,40,40,0.03)" : "transparent",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.title}
            </span>
            <span style={{ fontSize: 11, color: "#4a2d5a" }}>{r.product}</span>
            <span style={{ fontSize: 10, color: "#8b3b9e", fontWeight: 700 }}>{r.stage}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 5,
              background: `${RISK_COLORS[r.riskLevel]}18`,
              color: RISK_COLORS[r.riskLevel] ?? "#8b3b9e",
              display: "inline-block",
            }}>{r.riskLevel}</span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: r.isBreached ? "#c62828" : "#27ae60",
            }}>
              {r.hoursElapsed}h
            </span>
            <span style={{
              fontSize: 10, fontWeight: 800,
              padding: "2px 8px", borderRadius: 5,
              background: r.isBreached ? "rgba(198,40,40,0.10)" : "rgba(39,174,96,0.10)",
              color: r.isBreached ? "#c62828" : "#27ae60",
              display: "inline-block",
            }}>
              {r.isBreached ? "BREACHED" : "OK"}
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#b0a0bc", fontWeight: 600, margin: 0 }}>
              No open ECOs — all clear! ✓
            </p>
          </div>
        )}
      </div>
    </ReportShell>
  )
}
