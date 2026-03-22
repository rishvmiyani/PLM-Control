"use client"

import { CheckCircle2, Circle, GitBranch } from "lucide-react"
import { format } from "date-fns"

interface TimelineItem {
  id:        string
  version:   number
  status:    string
  createdAt: string
  isCurrent: boolean
}

const font = "'DM Sans', sans-serif"

export default function VersionTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div style={{ fontFamily: font, position: "relative", paddingLeft: 32 }}>

      {/* Vertical line */}
      <div style={{
        position:   "absolute",
        left:       11,
        top:        8,
        bottom:     8,
        width:      2,
        background: "linear-gradient(180deg,#8b3b9e,rgba(190,113,209,0.15))",
        borderRadius: 2,
      }} />

      {items.map((item, i) => {
        const isActive = item.status === "ACTIVE"

        return (
          <div key={item.id} style={{
            position:     "relative",
            marginBottom: i < items.length - 1 ? 28 : 0,
            display:      "flex",
            alignItems:   "flex-start",
            gap:          16,
          }}>

            {/* Dot */}
            <div style={{
              position:       "absolute",
              left:           -32,
              top:            2,
              width:          22,
              height:         22,
              borderRadius:   "50%",
              background:     item.isCurrent
                ? "linear-gradient(135deg,#8b3b9e,#be71d1)"
                : isActive
                ? "rgba(39,174,96,0.12)"
                : "rgba(160,144,184,0.12)",
              border:         item.isCurrent
                ? "none"
                : `2px solid ${isActive ? "#27ae60" : "rgba(190,113,209,0.25)"}`,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              boxShadow:      item.isCurrent
                ? "0 2px 8px rgba(139,59,158,0.30)"
                : "none",
              zIndex:         1,
            }}>
              {item.isCurrent
                ? <GitBranch   style={{ width: 11, height: 11, color: "#fff" }} />
                : isActive
                ? <CheckCircle2 style={{ width: 11, height: 11, color: "#27ae60" }} />
                : <Circle       style={{ width: 11, height: 11, color: "#a090b8" }} />
              }
            </div>

            {/* Card */}
            <div style={{
              flex:         1,
              background:   item.isCurrent
                ? "rgba(139,59,158,0.05)"
                : "#fff",
              border:       item.isCurrent
                ? "1px solid rgba(139,59,158,0.22)"
                : "1px solid rgba(190,113,209,0.14)",
              borderRadius: 12,
              padding:      "12px 16px",
              boxShadow:    "0 2px 8px rgba(139,59,158,0.06)",
            }}>
              <div style={{
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "center",
                marginBottom:   4,
              }}>
                {/* Version label */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize:   13,
                    fontWeight: 800,
                    color:      "#2d1a38",
                  }}>
                    BOM v{item.version}
                  </span>
                  {item.isCurrent && (
                    <span style={{
                      fontSize:   9,
                      fontWeight: 800,
                      background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                      color:      "#fff",
                      padding:    "2px 8px",
                      borderRadius: 5,
                      letterSpacing: "0.05em",
                    }}>
                      CURRENT
                    </span>
                  )}
                </div>

                {/* Status badge */}
                <span style={{
                  padding:      "2px 10px",
                  borderRadius: 20,
                  fontSize:     10,
                  fontWeight:   700,
                  background:   isActive
                    ? "rgba(39,174,96,0.10)"
                    : "rgba(160,144,184,0.12)",
                  color:        isActive ? "#27ae60" : "#8b7aaa",
                }}>
                  {item.status}
                </span>
              </div>

              {/* Date */}
              <p style={{ fontSize: 11, color: "#b0a0bc", margin: 0 }}>
                {format(new Date(item.createdAt), "dd MMM yyyy · HH:mm")}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
