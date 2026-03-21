"use client"

import ReportShell from "./ReportShell"
import { format } from "date-fns"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from "recharts"

const STAGE_COLORS: Record<string, string> = {
  "New":                "#8b3b9e",
  "Engineering Review": "#be71d1",
  "Approval":           "#e6c6ed",
  "Done":               "#27ae60",
  "Rejected":           "#e63b6f",
}

const RISK_COLORS: Record<string, string> = {
  LOW:      "#27ae60",
  MEDIUM:   "#8b3b9e",
  HIGH:     "#e07b00",
  CRITICAL: "#c62828",
}

interface Row {
  id: string; title: string; stage: string
  riskLevel: string; riskScore: number
  product: string; user: string; createdAt: string
}

function exportPDF(rows: Row[]) {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(({ default: autoTable }) => {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("ECO Summary Report", 14, 18)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)
      autoTable(doc, {
        startY: 32,
        head: [["Title", "Product", "Stage", "Risk", "By", "Date"]],
        body: rows.map((r) => [
          r.title, r.product, r.stage, r.riskLevel,
          r.user, format(new Date(r.createdAt), "dd MMM yyyy"),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 59, 158] },
      })
      doc.save("eco-summary.pdf")
    })
  })
}

export default function EcoSummaryClient({
  rows, byStage, byRisk,
}: {
  rows: Row[]
  byStage: { name: string; value: number }[]
  byRisk:  { name: string; value: number }[]
}) {
  const font = "'DM Sans', sans-serif"

  return (
    <ReportShell
      title="ECO Summary"
      description="Overview of all Engineering Change Orders by stage and type"
      onExport={() => exportPDF(rows)}
    >
      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 12, marginBottom: 22,
      }}>
        {[
          { label: "Total ECOs",   value: rows.length,                                     color: "#8b3b9e" },
          { label: "Open",         value: rows.filter(r => r.stage !== "Done" && r.stage !== "Rejected").length, color: "#be71d1" },
          { label: "Done",         value: rows.filter(r => r.stage === "Done").length,      color: "#27ae60" },
          { label: "Rejected",     value: rows.filter(r => r.stage === "Rejected").length,  color: "#e63b6f" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(190,113,209,0.14)",
            borderRadius: 14, padding: "16px",
            textAlign: "center",
            boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
          }}>
            <p style={{ fontSize: 26, fontWeight: 800, color, margin: 0 }}>{value}</p>
            <p style={{ fontSize: 11, color: "#9b6aab", margin: "4px 0 0", fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 16, marginBottom: 22,
      }}>
        {/* Bar Chart — by stage */}
        <div style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(190,113,209,0.14)",
          borderRadius: 16, padding: "18px",
          boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: "0 0 14px" }}>
            ECOs by Stage
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStage}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {byStage.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STAGE_COLORS[entry.name] ?? "#8b3b9e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — by risk */}
        <div style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(190,113,209,0.14)",
          borderRadius: 16, padding: "18px",
          boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: "0 0 14px" }}>
            ECOs by Risk Level
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={byRisk} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={70} label
              >
                {byRisk.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name] ?? "#8b3b9e"} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
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
            All ECOs ({rows.length})
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 110px 90px 90px 100px",
          padding: "7px 18px",
          background: "rgba(245,240,252,0.5)",
          borderBottom: "1px solid rgba(190,113,209,0.08)",
        }}>
          {["TITLE","PRODUCT","STAGE","RISK","BY","DATE"].map(col => (
            <span key={col} style={{ fontSize: 10, fontWeight: 800, color: "#9b6aab", letterSpacing: "0.06em" }}>
              {col}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={r.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 110px 90px 90px 100px",
            padding: "11px 18px", alignItems: "center",
            borderBottom: i < rows.length - 1 ? "1px solid rgba(190,113,209,0.07)" : "none",
            background: i % 2 === 0 ? "rgba(245,240,252,0.2)" : "transparent",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.title}
            </span>
            <span style={{ fontSize: 11, color: "#4a2d5a" }}>{r.product}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
              background: "rgba(139,59,158,0.08)", color: "#8b3b9e",
              display: "inline-block",
            }}>{r.stage}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 5,
              background: `${RISK_COLORS[r.riskLevel] ?? "#8b3b9e"}18`,
              color: RISK_COLORS[r.riskLevel] ?? "#8b3b9e",
              display: "inline-block",
            }}>{r.riskLevel}</span>
            <span style={{ fontSize: 11, color: "#9b6aab" }}>{r.user}</span>
            <span style={{ fontSize: 11, color: "#b0a0bc" }}>
              {format(new Date(r.createdAt), "dd MMM yyyy")}
            </span>
          </div>
        ))}
      </div>
    </ReportShell>
  )
}
