"use client"

import ReportShell from "./ReportShell"
import { format } from "date-fns"
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts"

interface Row {
  id: string; name: string; version: number; status: string
  salePrice: number; costPrice: number
  ecoCount: number; bomCount: number
  createdAt: string; updatedAt: string
}

interface GroupedRow {
  name: string; totalVersions: number; latestVersion: number
  activeCount: number; ecoCount: number; bomCount: number
}

function exportPDF(rows: Row[], grouped: GroupedRow[]) {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(({ default: autoTable }) => {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("Product Versions Report", 14, 18)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)

      doc.setFontSize(12)
      doc.text("Summary by Product", 14, 36)
      autoTable(doc, {
        startY: 40,
        head: [["Product", "Total Versions", "Latest", "Active", "ECOs", "BOMs"]],
        body: grouped.map((g) => [
          g.name, g.totalVersions, `v${g.latestVersion}`,
          g.activeCount, g.ecoCount, g.bomCount,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 59, 158] },
      })

      const y = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(12)
      doc.text("All Product Versions", 14, y)
      autoTable(doc, {
        startY: y + 4,
        head: [["Name", "Version", "Status", "Sale Price", "ECOs", "Created"]],
        body: rows.map((r) => [
          r.name, `v${r.version}`, r.status,
          `₹${r.salePrice.toLocaleString()}`,
          r.ecoCount,
          format(new Date(r.createdAt), "dd MMM yyyy"),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [190, 113, 209] },
      })

      doc.save("product-versions.pdf")
    })
  })
}

export default function ProductVersionsClient({
  rows, grouped, versionChart,
}: {
  rows:         Row[]
  grouped:      GroupedRow[]
  versionChart: { name: string; versions: number; ecos: number }[]
}) {
  const font         = "'DM Sans', sans-serif"
  const totalProducts = grouped.length
  const mostVersioned = grouped.sort((a, b) => b.totalVersions - a.totalVersions)[0]
  const totalECOs     = grouped.reduce((s, g) => s + g.ecoCount, 0)

  return (
    <ReportShell
      title="Product Versions"
      description="Version history and change frequency per product"
      onExport={() => exportPDF(rows, grouped)}
    >

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: 12, marginBottom: 22,
      }}>
        {[
          { label: "Total Products",   value: totalProducts,           color: "#8b3b9e" },
          { label: "Total Versions",   value: rows.length,             color: "#be71d1" },
          { label: "Total ECOs Raised",value: totalECOs,               color: "#27ae60" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(190,113,209,0.14)",
            borderRadius: 14, padding: "20px 16px",
            textAlign: "center",
            boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
          }}>
            <p style={{ fontSize: 30, fontWeight: 800, color, margin: 0 }}>{value}</p>
            <p style={{ fontSize: 11, color: "#9b6aab", margin: "4px 0 0", fontWeight: 600 }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Most versioned callout */}
      {mostVersioned && (
        <div style={{
          background: "rgba(139,59,158,0.05)",
          border: "1px solid rgba(190,113,209,0.20)",
          borderRadius: 12, padding: "14px 18px",
          marginBottom: 22,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(139,59,158,0.12)",
            display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
            fontSize: 16,
          }}>🏆</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
              Most versioned: {mostVersioned.name}
            </p>
            <p style={{ fontSize: 11, color: "#9b6aab", margin: "2px 0 0" }}>
              {mostVersioned.totalVersions} versions · {mostVersioned.ecoCount} ECOs raised
            </p>
          </div>
        </div>
      )}

      {/* Chart — versions + ecos per product */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16, padding: "18px",
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        marginBottom: 22,
      }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: "0 0 14px" }}>
          Versions &amp; ECOs per Product
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={versionChart} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(190,113,209,0.15)" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="versions" fill="#8b3b9e" radius={[5,5,0,0]} name="Versions" />
            <Bar dataKey="ecos"     fill="#be71d1" radius={[5,5,0,0]} name="ECOs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table by Product */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        marginBottom: 22,
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(190,113,209,0.10)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            Summary by Product
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 90px 80px 70px 70px",
          padding: "7px 18px",
          background: "rgba(245,240,252,0.5)",
          borderBottom: "1px solid rgba(190,113,209,0.08)",
        }}>
          {["PRODUCT","VERSIONS","LATEST","ACTIVE","ECOS","BOMS"].map(col => (
            <span key={col} style={{
              fontSize: 10, fontWeight: 800,
              color: "#9b6aab", letterSpacing: "0.06em",
            }}>
              {col}
            </span>
          ))}
        </div>
        {grouped.map((g, i) => (
          <div key={g.name} style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 90px 80px 70px 70px",
            padding: "11px 18px", alignItems: "center",
            borderBottom: i < grouped.length - 1
              ? "1px solid rgba(190,113,209,0.07)" : "none",
            background: i % 2 === 0 ? "rgba(245,240,252,0.2)" : "transparent",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>
              {g.name}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 800, color: "#8b3b9e",
            }}>
              {g.totalVersions}
            </span>
            <span style={{
              display: "inline-block",
              fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 5,
              background: "rgba(139,59,158,0.08)", color: "#8b3b9e",
            }}>
              v{g.latestVersion}
            </span>
            <span style={{
              display: "inline-block",
              fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 5,
              background: g.activeCount > 0
                ? "rgba(39,174,96,0.10)" : "rgba(160,144,184,0.12)",
              color: g.activeCount > 0 ? "#27ae60" : "#8b7aaa",
            }}>
              {g.activeCount}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>
              {g.ecoCount}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>
              {g.bomCount}
            </span>
          </div>
        ))}
      </div>

      {/* All versions detail table */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(190,113,209,0.10)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            All Versions ({rows.length})
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 70px 90px 110px 70px 100px",
          padding: "7px 18px",
          background: "rgba(245,240,252,0.5)",
          borderBottom: "1px solid rgba(190,113,209,0.08)",
        }}>
          {["NAME","VER","STATUS","SALE PRICE","ECOS","CREATED"].map(col => (
            <span key={col} style={{
              fontSize: 10, fontWeight: 800,
              color: "#9b6aab", letterSpacing: "0.06em",
            }}>
              {col}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={r.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 70px 90px 110px 70px 100px",
            padding: "11px 18px", alignItems: "center",
            borderBottom: i < rows.length - 1
              ? "1px solid rgba(190,113,209,0.07)" : "none",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#8b3b9e",
              padding: "2px 7px", borderRadius: 5,
              background: "rgba(139,59,158,0.08)",
              display: "inline-block",
            }}>
              v{r.version}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: "2px 7px", borderRadius: 5,
              background: r.status === "ACTIVE"
                ? "rgba(39,174,96,0.10)" : "rgba(160,144,184,0.12)",
              color: r.status === "ACTIVE" ? "#27ae60" : "#8b7aaa",
              display: "inline-block",
            }}>
              {r.status}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#27ae60" }}>
              ₹{r.salePrice.toLocaleString()}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>
              {r.ecoCount}
            </span>
            <span style={{ fontSize: 11, color: "#b0a0bc" }}>
              {format(new Date(r.createdAt), "dd MMM yyyy")}
            </span>
          </div>
        ))}
      </div>

    </ReportShell>
  )
}
