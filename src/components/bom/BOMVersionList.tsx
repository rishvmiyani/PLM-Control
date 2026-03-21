"use client"

import Link from "next/link"
import { CheckCircle2, Circle, ChevronRight } from "lucide-react"

interface VersionRow {
  id:        string
  version:   number
  status:    string
  createdAt: string
  isCurrent: boolean
}

export default function BOMVersionList({ versions }: { versions: VersionRow[] }) {
  const font = "'DM Sans', sans-serif"

  return (
    <>
      {versions.map((v) => (
        <Link key={v.id} href={`/bom/${v.id}`} style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 10,
              border: v.isCurrent
                ? "1px solid rgba(139,59,158,0.25)"
                : "1px solid rgba(190,113,209,0.10)",
              background: v.isCurrent
                ? "rgba(139,59,158,0.05)"
                : "rgba(245,240,252,0.4)",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: font,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(139,59,158,0.08)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = v.isCurrent
                ? "rgba(139,59,158,0.05)"
                : "rgba(245,240,252,0.4)")}
          >
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: v.status === "ACTIVE"
                  ? "rgba(39,174,96,0.10)"
                  : "rgba(160,144,184,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: v.status === "ACTIVE" ? "#27ae60" : "#a090b8",
              }}>
                {v.status === "ACTIVE"
                  ? <CheckCircle2 style={{ width: 13, height: 13 }} />
                  : <Circle       style={{ width: 13, height: 13 }} />}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>
                    BOM v{v.version}
                  </span>
                  {v.isCurrent && (
                    <span style={{
                      fontSize: 9, fontWeight: 800,
                      background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                      color: "#fff", padding: "1px 7px",
                      borderRadius: 5, letterSpacing: "0.05em",
                    }}>
                      CURRENT
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: "#b0a0bc" }}>
                  {new Date(v.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                padding: "2px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                background: v.status === "ACTIVE"
                  ? "rgba(39,174,96,0.10)" : "rgba(160,144,184,0.12)",
                color: v.status === "ACTIVE" ? "#27ae60" : "#8b7aaa",
              }}>
                {v.status}
              </span>
              <ChevronRight style={{ width: 13, height: 13, color: "#c0a8d0" }} />
            </div>
          </div>
        </Link>
      ))}
    </>
  )
}
