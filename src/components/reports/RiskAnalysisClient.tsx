"use client"

import ReportShell from "./ReportShell"
import { format } from "date-fns"
import {
  RadialBarChart, RadialBar, Legend,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts"

const RISK_COLORS: Record<string, string> = {
  LOW: "#27ae60", MEDIUM: "#8b3b9e", HIGH: "#e07b00", CRITICAL: "#c62828",
}

interface Row {
  id: string; title: string; riskLevel: string; riskScore: number
  stage: string; product: string; user: string; createdAt: string
}

function exportPDF(rows: Row[]) {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(({ default: autoTable }) => {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("Risk Analysis Report", 14, 18)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)
      autoTable(doc, {
        startY: 32,
        head: [["Title", "Product", "Risk Level", "Risk Score", "Stage", "By"]],
        body: rows.map((r) => [
          r.title, r.product, r.riskLevel, r.riskScore, r.stage, r.user,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [198, 40, 40] },
      })
      doc.save("risk-analysis.pdf")
    })
  })
}

export default function RiskAnalysisClient({
  rows, byRisk,
}: {
  rows: Row[]
  byRisk: { name: string; value: number; avg: number }[]
}) {
  const font = "'DM Sans', sans-serif"
  const critical = rows.filter(r => r.riskLevel === "CRITICAL").length
  const high      = rows.filter(r => r.riskLevel === "HIGH").length

  return (
    <ReportShell
      title="Risk Analysis"
      description="Distribution of ECOs by risk level across products"
      onExport={() => exportPDF(rows)}
    >
      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 12, marginBottom: 22,
      }}>
        {byRisk.map(({ name, value, avg }) => (
          <div key={name} style={{
            background: `${RISK_COLORS[name]}0d`,
            border: `1px solid ${RISK_COLORS[name]}30`,
            borderRadius: 14, padding: "16px", textAlign: "center",
          }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: RISK_COLORS[name], margin: 0 }}>
              {value}
            </p>
            <p style={{ fontSize: 11, fontWeight: 800, color: RISK_COLORS[name], margin: "3px 0 2px" }}>
              {name}
            </p>
            <p style={{ fontSize: 10, color: "#9b6aab", margin: 0 }}>
              avg score: {avg}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 16, marginBottom: 22,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(190,113,209,0.14)",
          borderRadius: 16, padding: "18px",
          boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: "0 0 14px" }}>
            Count by Risk Level
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byRisk}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {byRisk.map(entry => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(190,113,209,0.14)",
          borderRadius: 16, padding: "18px",
          boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: "0 0 14px" }}>
            Avg Risk Score by Level
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byRisk}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="avg" radius={[6,6,0,0]}>
                {byRisk.map(entry => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
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
            ECOs by Risk ({rows.length})
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 90px 80px 110px 90px",
          padding: "7px 18px",
          background: "rgba(245,240,252,0.5)",
          borderBottom: "1px solid rgba(190,113,209,0.08)",
        }}>
          {["TITLE","PRODUCT","RISK","SCORE","STAGE","DATE"].map(col => (
            <span key={col} style={{ fontSize: 10, fontWeight: 800, color: "#9b6aab", letterSpacing: "0.06em" }}>
              {col}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={r.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 90px 80px 110px 90px",
            padding: "11px 18px", alignItems: "center",
            borderBottom: i < rows.length - 1 ? "1px solid rgba(190,113,209,0.07)" : "none",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.title}
            </span>
            <span style={{ fontSize: 11, color: "#4a2d5a" }}>{r.product}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 5,
              background: `${RISK_COLORS[r.riskLevel]}18`,
              color: RISK_COLORS[r.riskLevel] ?? "#8b3b9e",
              display: "inline-block",
            }}>{r.riskLevel}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#2d1a38" }}>{r.riskScore}</span>
            <span style={{ fontSize: 10, color: "#8b3b9e", fontWeight: 700 }}>{r.stage}</span>
            <span style={{ fontSize: 11, color: "#b0a0bc" }}>
              {format(new Date(r.createdAt), "dd MMM yyyy")}
            </span>
          </div>
        ))}
      </div>
    </ReportShell>
  )
}
