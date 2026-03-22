import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StagesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard")

  const stages = await prisma.eCOStage.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { approvalRules: true } } },
  })

  const font = "'DM Sans', sans-serif"

  return (
    <div style={{ fontFamily: font, maxWidth: 860, padding: "0 4px" }}>

      {/* ── Header Card ─────────────────────────── */}
      <div style={{
        background:   "rgba(255,255,255,0.90)",
        border:       "1px solid rgba(190,113,209,0.14)",
        borderRadius: 18,
        padding:      "22px 24px",
        marginBottom: 24,
        boxShadow:    "0 2px 14px rgba(139,59,158,0.07)",
        display:      "flex",
        alignItems:   "center",
        gap:          16,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* menu icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18"
              stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 style={{
            fontSize: "1.35rem", fontWeight: 800,
            color: "#2d1a38", margin: 0,
          }}>
            ECO Stages
          </h1>
          <p style={{ fontSize: 13, color: "#9b8aab", margin: "3px 0 0", fontWeight: 500 }}>
            Workflow stages for the ECO lifecycle
          </p>
        </div>
      </div>

      {/* ── Table ───────────────────────────────── */}
      <div style={{
        background:   "rgba(255,255,255,0.95)",
        border:       "1px solid rgba(190,113,209,0.12)",
        borderRadius: 16,
        overflow:     "hidden",
        boxShadow:    "0 2px 14px rgba(139,59,158,0.06)",
      }}>

        {/* Column Headers */}
        <div style={{
          display:          "grid",
          gridTemplateColumns: "80px 1fr 180px 120px 160px",
          padding:          "12px 24px",
          borderBottom:     "1px solid rgba(190,113,209,0.10)",
        }}>
          {["ORDER", "STAGE NAME", "REQUIRES APPROVAL", "SLA", "APPROVAL RULES"].map((col) => (
            <span key={col} style={{
              fontSize:      11,
              fontWeight:    800,
              color:         "#8b6aab",
              letterSpacing: "0.07em",
            }}>
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {stages.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#b0a0bc", fontWeight: 600, margin: 0 }}>
              No stages configured yet.
            </p>
          </div>
        ) : (
          stages.map((stage, i) => (
            <div
              key={stage.id}
              style={{
                display:          "grid",
                gridTemplateColumns: "80px 1fr 180px 120px 160px",
                padding:          "18px 24px",
                alignItems:       "center",
                borderBottom:     i < stages.length - 1
                  ? "1px solid rgba(190,113,209,0.08)" : "none",
                background:       i % 2 === 0
                  ? "rgba(248,244,253,0.5)" : "transparent",
                transition:       "background 0.12s",
              }}
            >
              {/* Order number */}
              <div>
                <div style={{
                  width:          34,
                  height:         34,
                  borderRadius:   "50%",
                  background:     "rgba(190,113,209,0.12)",
                  border:         "1px solid rgba(190,113,209,0.20)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       13,
                  fontWeight:     800,
                  color:          "#8b3b9e",
                }}>
                  {stage.order}
                </div>
              </div>

              {/* Stage Name */}
              <span style={{
                fontSize:   14,
                fontWeight: 600,
                color:      "#2d1a38",
              }}>
                {stage.name}
              </span>

              {/* Requires Approval badge */}
              <div>
                <span style={{
                  display:         "inline-flex",
                  alignItems:      "center",
                  padding:         "5px 16px",
                  borderRadius:    20,
                  fontSize:        12,
                  fontWeight:      700,
                  background:      stage.requireApproval
                    ? "linear-gradient(135deg,#8b3b9e,#be71d1)"
                    : "rgba(190,113,209,0.10)",
                  color:           stage.requireApproval ? "#fff" : "#8b6aab",
                  border:          stage.requireApproval
                    ? "none"
                    : "1px solid rgba(190,113,209,0.25)",
                  boxShadow:       stage.requireApproval
                    ? "0 3px 10px rgba(139,59,158,0.25)"
                    : "none",
                }}>
                  {stage.requireApproval ? "Yes" : "No"}
                </span>
              </div>

              {/* SLA */}
              <div>
                <span style={{
                  display:      "inline-flex",
                  alignItems:   "center",
                  gap:          5,
                  padding:      "5px 14px",
                  borderRadius: 20,
                  fontSize:     12,
                  fontWeight:   600,
                  background:   "rgba(190,113,209,0.08)",
                  border:       "1px solid rgba(190,113,209,0.20)",
                  color:        "#6b3a8a",
                }}>
                  <Clock style={{ width: 11, height: 11 }} />
                  {stage.slaHours}h
                </span>
              </div>

              {/* Approval Rules count */}
              <div>
                <span style={{
                  fontSize:   13,
                  fontWeight: 600,
                  color:      "#6b3a8a",
                  display:    "flex",
                  alignItems: "center",
                  gap:        6,
                }}>
                  <span style={{
                    width:        7,
                    height:       7,
                    borderRadius: "50%",
                    background:   "#be71d1",
                    display:      "inline-block",
                    flexShrink:   0,
                  }} />
                  {stage._count.approvalRules}{" "}
                  {stage._count.approvalRules === 1 ? "rule" : "rules"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
