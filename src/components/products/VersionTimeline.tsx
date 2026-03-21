"use client"

import { CheckCircle2, Circle, Clock } from "lucide-react"

interface VersionItem {
  id: string
  version: number
  status: string
  createdAt: string
  updatedAt?: string
}

interface VersionTimelineProps {
  items: VersionItem[]
  currentVersion?: number
}

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string; icon: React.ReactNode }> = {
  ACTIVE: {
    bg: "rgba(39,174,96,0.08)",
    color: "#27ae60",
    dot: "#27ae60",
    icon: <CheckCircle2 style={{ width: 13, height: 13 }} />,
  },
  ARCHIVED: {
    bg: "rgba(160,144,184,0.10)",
    color: "#8b7aaa",
    dot: "#c0a8d0",
    icon: <Circle style={{ width: 13, height: 13 }} />,
  },
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    })
  } catch {
    return iso
  }
}

export default function VersionTimeline({ items, currentVersion }: VersionTimelineProps) {
  const font = "'DM Sans', sans-serif"
  const sorted = [...items].sort((a, b) => b.version - a.version)

  if (sorted.length === 0) {
    return (
      <div style={{
        fontFamily: font,
        padding: "28px 20px", textAlign: "center",
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 14,
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      }}>
        <Clock style={{ width: 22, height: 22, color: "#be71d1", margin: "0 auto 10px" }} />
        <p style={{ fontSize: 13, color: "#b0a0bc", fontWeight: 600, margin: 0 }}>
          No version history yet
        </p>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: font,
      background: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(190,113,209,0.14)",
      borderRadius: 14,
      boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid rgba(190,113,209,0.10)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
          Version History
        </h3>
        <span style={{
          fontSize: 10, fontWeight: 700, color: "#9b6aab",
          background: "rgba(139,59,158,0.08)",
          padding: "2px 8px", borderRadius: 6,
        }}>
          {sorted.length} version{sorted.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ padding: "16px 18px" }}>
        {sorted.map((item, i) => {
          const isCurrent =
            currentVersion !== undefined
              ? item.version === currentVersion
              : i === 0
          const style = STATUS_STYLE[item.status] ?? STATUS_STYLE["ARCHIVED"]

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: 14,
                paddingBottom: i < sorted.length - 1 ? 18 : 0,
                position: "relative",
              }}
            >
              {/* Line + Dot */}
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", flexShrink: 0,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: isCurrent
                    ? "linear-gradient(135deg,#8b3b9e,#be71d1)"
                    : style.bg,
                  border: isCurrent
                    ? "2px solid #8b3b9e"
                    : `2px solid ${style.dot}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isCurrent ? "#fff" : style.color,
                  fontSize: 11, fontWeight: 800,
                  boxShadow: isCurrent
                    ? "0 2px 10px rgba(139,59,158,0.25)" : "none",
                  zIndex: 1,
                }}>
                  v{item.version}
                </div>

                {/* Vertical connector */}
                {i < sorted.length - 1 && (
                  <div style={{
                    width: 2,
                    flex: 1,
                    minHeight: 18,
                    background: "rgba(190,113,209,0.15)",
                    margin: "4px 0",
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{
                flex: 1,
                background: isCurrent
                  ? "rgba(139,59,158,0.04)"
                  : "rgba(245,240,252,0.4)",
                border: isCurrent
                  ? "1px solid rgba(139,59,158,0.18)"
                  : "1px solid rgba(190,113,209,0.10)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: i < sorted.length - 1 ? 0 : 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: 8,
                  flexWrap: "wrap",
                }}>
                  {/* Left */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2d1a38" }}>
                      Version {item.version}
                    </span>
                    {isCurrent && (
                      <span style={{
                        fontSize: 9, fontWeight: 800,
                        background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                        color: "#fff",
                        padding: "2px 7px", borderRadius: 5,
                        letterSpacing: "0.05em",
                      }}>
                        CURRENT
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 9px", borderRadius: 6,
                    background: style.bg, color: style.color,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                  }}>
                    {style.icon}
                    {item.status}
                  </span>
                </div>

                {/* Dates */}
                <div style={{
                  display: "flex", gap: 14, marginTop: 6,
                  flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 10, color: "#b0a0bc", fontWeight: 500 }}>
                    Created: {formatDate(item.createdAt)}
                  </span>
                  {item.updatedAt && item.updatedAt !== item.createdAt && (
                    <span style={{ fontSize: 10, color: "#b0a0bc", fontWeight: 500 }}>
                      Updated: {formatDate(item.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
