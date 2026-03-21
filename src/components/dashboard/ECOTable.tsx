"use client"

import Link from "next/link"
import { format, differenceInHours } from "date-fns"
import { GitPullRequest, Clock, ChevronRight, Plus } from "lucide-react"

const STAGE_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  "New":                { bg: "rgba(139,59,158,0.08)",  color: "#8b3b9e", dot: "#8b3b9e" },
  "Engineering Review": { bg: "rgba(190,113,209,0.12)", color: "#7a2d8e", dot: "#be71d1" },
  "Approval":           { bg: "rgba(139,59,158,0.15)",  color: "#5a1d6e", dot: "#8b3b9e" },
  "Done":               { bg: "rgba(39,174,96,0.10)",   color: "#27ae60", dot: "#27ae60" },
  "Rejected":           { bg: "rgba(230,59,111,0.09)",  color: "#e63b6f", dot: "#e63b6f" },
}

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  LOW:      { bg: "rgba(39,174,96,0.10)",  color: "#27ae60" },
  MEDIUM:   { bg: "rgba(139,59,158,0.10)", color: "#8b3b9e" },
  HIGH:     { bg: "rgba(224,123,0,0.10)",  color: "#e07b00" },
  CRITICAL: { bg: "rgba(198,40,40,0.10)",  color: "#c62828" },
}

interface ECORow {
  id:             string
  title:          string
  stage:          string
  riskLevel:      string
  riskScore:      number
  conflictStatus: string
  createdAt:      string
  enteredStageAt: string
  product: {
    name:    string
    version: number
  }
}

export default function ECOTable({
  ecos,
  slaHours,
}: {
  ecos: ECORow[]
  slaHours: number
}) {
  const font = "'DM Sans', sans-serif"

  return (
    <div style={{
      background: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(190,113,209,0.14)",
      borderRadius: 18,
      boxShadow: "0 4px 24px rgba(139,59,158,0.08)",
      overflow: "hidden",
      fontFamily: font,
    }}>

      {/* Card header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(190,113,209,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
          My ECOs
        </h2>
        <Link href="/eco" style={{
          fontSize: 12, color: "#8b3b9e", fontWeight: 600,
          textDecoration: "none",
          display: "flex", alignItems: "center", gap: 2,
        }}>
          View all <ChevronRight style={{ width: 13, height: 13 }} />
        </Link>
      </div>

      {/* Empty state */}
      {ecos.length === 0 ? (
        <div style={{ padding: "52px 20px", textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: "0 auto 14px",
            background: "rgba(139,59,158,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GitPullRequest style={{ width: 22, height: 22, color: "#be71d1" }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#4a2d5a", margin: "0 0 5px" }}>
            No ECOs yet
          </p>
          <p style={{ fontSize: 12, color: "#b0a0bc", margin: "0 0 18px" }}>
            Create your first Engineering Change Order
          </p>
          <Link href="/eco/new" style={{ textDecoration: "none" }}>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 22px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
              color: "#fff", fontSize: 12, fontWeight: 600,
              fontFamily: font, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(139,59,158,0.22)",
            }}>
              <Plus style={{ width: 13, height: 13 }} />
              Create your first ECO
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Column labels */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 130px 90px 110px 110px",
            padding: "8px 20px",
            background: "rgba(245,240,252,0.5)",
            borderBottom: "1px solid rgba(190,113,209,0.10)",
          }}>
            {["TITLE", "PRODUCT", "RISK", "SLA", "STAGE"].map((col) => (
              <span key={col} style={{
                fontSize: 10, fontWeight: 800,
                color: "#9b6aab", letterSpacing: "0.06em",
              }}>
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {ecos.map((eco, i) => {
            const stageStyle = STAGE_COLORS[eco.stage] ?? STAGE_COLORS["New"]
            const riskStyle  = RISK_COLORS[eco.riskLevel] ?? RISK_COLORS["MEDIUM"]
            const isDone     = eco.stage === "Done" || eco.stage === "Rejected"
            const hoursElapsed = differenceInHours(new Date(), new Date(eco.enteredStageAt))
            const hoursLeft    = Math.max(0, slaHours - hoursElapsed)
            const isBreached   = hoursElapsed >= slaHours

            return (
              <Link key={eco.id} href={`/eco/${eco.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 130px 90px 110px 110px",
                    padding: "13px 20px",
                    alignItems: "center",
                    borderBottom: i < ecos.length - 1
                      ? "1px solid rgba(190,113,209,0.07)" : "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(139,59,158,0.03)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")}
                >
                  {/* Title */}
                  <div style={{ minWidth: 0, paddingRight: 12 }}>
                    <p style={{
                      fontSize: 12, fontWeight: 700, color: "#2d1a38",
                      margin: 0, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {eco.title}
                    </p>
                    <p style={{ fontSize: 10, color: "#b0a0bc", margin: "2px 0 0" }}>
                      {format(new Date(eco.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>

                  {/* Product */}
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#4a2d5a", margin: 0 }}>
                      {eco.product.name}
                    </p>
                    <p style={{ fontSize: 10, color: "#b0a0bc", margin: "1px 0 0" }}>
                      v{eco.product.version}
                    </p>
                  </div>

                  {/* Risk */}
                  <div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 9px", borderRadius: 6,
                      background: riskStyle.bg, color: riskStyle.color,
                      fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
                    }}>
                      {eco.riskLevel}
                      {eco.riskScore > 0 && (
                        <span style={{ fontSize: 9, opacity: 0.7 }}>
                          {eco.riskScore}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* SLA */}
                  <div>
                    {isDone ? (
                      <span style={{ fontSize: 10, color: "#27ae60", fontWeight: 600 }}>
                        Completed
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 9px", borderRadius: 6,
                        background: isBreached
                          ? "rgba(198,40,40,0.08)" : "rgba(39,174,96,0.08)",
                        color: isBreached ? "#c62828" : "#27ae60",
                        fontSize: 10, fontWeight: 700,
                      }}>
                        <Clock style={{ width: 9, height: 9 }} />
                        {isBreached ? "overdue" : `${hoursLeft}h left`}
                      </span>
                    )}
                  </div>

                  {/* Stage */}
                  <div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 9px", borderRadius: 6,
                      background: stageStyle.bg, color: stageStyle.color,
                      fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: stageStyle.dot, flexShrink: 0,
                      }} />
                      {eco.stage}
                    </span>
                  </div>

                </div>
              </Link>
            )
          })}
        </>
      )}
    </div>
  )
}
