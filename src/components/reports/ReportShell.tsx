"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"

interface Props {
  title:       string
  description: string
  backHref?:   string
  children:    React.ReactNode
  onExport?:   () => void
}

export default function ReportShell({
  title, description, children, onExport, backHref = "/reports",
}: Props) {
  const font = "'DM Sans', sans-serif"

  return (
    <div style={{ fontFamily: font, maxWidth: 900, padding: "0 4px" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Link href={backHref} style={{ textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "rgba(139,59,158,0.08)",
              border: "1px solid rgba(190,113,209,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <ArrowLeft style={{ width: 15, height: 15, color: "#8b3b9e" }} />
            </div>
          </Link>
          <div>
            <h1 style={{
              fontSize: "1.3rem", fontWeight: 800, margin: 0,
              background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {title}
            </h1>
            <p style={{ fontSize: 12, color: "#9b6aab", margin: "3px 0 0", fontWeight: 500 }}>
              {description}
            </p>
          </div>
        </div>

        {onExport && (
          <button
            onClick={onExport}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 11, border: "none",
              background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              fontFamily: font, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(139,59,158,0.26)",
            }}
          >
            <Download style={{ width: 14, height: 14 }} />
            Export PDF
          </button>
        )}
      </div>

      {children}
    </div>
  )
}
