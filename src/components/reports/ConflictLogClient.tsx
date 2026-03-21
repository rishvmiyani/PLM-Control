"use client"

import ReportShell from "./ReportShell"
import { format } from "date-fns"
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts"

const RISK_COLORS: Record<string, string> = {
  LOW: "#27ae60", MEDIUM: "#8b3b9e", HIGH: "#e07b00", CRITICAL: "#c62828",
}

interface Row {
  id: string; title: string; stage: string; riskLevel: string
  product: string; user: string; createdAt: string; conflictStatus: string
}

function exportPDF(rows: Row[]) {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(({ default: autoTable }) => {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("Conflict Log Report", 14, 18)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)
      autoTable(doc, {
        startY: 32,
        head: [["Title", "Product", "Stage", "Risk", "By", "Date"]],
        body: rows.map((r) => [
          r.title, r.product, r.stage, r.riskLevel, r.user,
          format(new Date(r.createdAt), "dd MMM yyyy"),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [230, 59, 111] },
      })
      doc.save("conflict-log.pdf")
    })
  })
}

export default function ConflictLogClient({ rows }: { rows: Row[] }) {
  const byStage = Object.entries(
    rows.reduce((acc, r) => {
      acc[r.stage] = (acc[r.stage] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  return (
    <ReportShell
      title="Conflict Log"
      description="All ECO conflicts detected and their resolution status"
      onExport={() => exportPDF(rows)}
    >
      {/* Stat */}
      <div style={{
        background: "rgba(230,59,111,0.06)",
        border: "1px solid rgba(230,59,111,0.20)",
        borderRadius: 14, padding: "20px",
        marginBottom: 22, textAlign: "center",
      }}>
        <p style={{ fontSize: 34, fontWeight: 800, color: "#e63b6f", margin: 0 }}>
          {rows.length}
        </p>
        <p style={{ fontSize: 12, color: "#e63b6f", fontWeight: 700, margin: "4px 0 0" }}>
          Total Conflicts
        </p>
      </div>

      {/* Chart */}
      {byStage.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(190,113,209,0.14)",
          borderRadius: 16, padding: "18px", marginBottom: 22,
          boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: "0 0 14px" }}>
            Conflicts by Stage
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStage}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#e63b6f" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(190,113,209,0.10)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            Conflict Records ({rows.length})
          </h2>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#b0a0bc", fontWeight: 600, margin: 0 }}>
              No conflicts detected ✓
            </p>
          </div>
        ) : (
          <>
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
                background: "rgba(230,59,111,0.02)",
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
                <span style={{ fontSize: 11, color: "#9b6aab" }}>{r.user}</span>
                <span style={{ fontSize: 11, color: "#b0a0bc" }}>
                  {format(new Date(r.createdAt), "dd MMM yyyy")}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </ReportShell>
  )
}
