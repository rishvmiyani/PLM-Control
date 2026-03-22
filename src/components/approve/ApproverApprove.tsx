import { auth }     from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma }   from "@/lib/prisma"
import Link         from "next/link"
import { format }   from "date-fns"
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react"

const font = "'DM Sans', sans-serif"

const RISK_COLOR: Record<string, string> = {
  LOW:      "#27ae60",
  MEDIUM:   "#e07b00",
  HIGH:     "#c62828",
  CRITICAL: "#c62828",
}

const STAGE_STYLE: Record<string, { bg: string; color: string }> = {
  "Approval":           { bg: "rgba(224,123,0,0.10)",  color: "#e07b00" },
  "Engineering Review": { bg: "rgba(59,122,190,0.10)", color: "#3b7abe" },
  "New":                { bg: "rgba(139,59,158,0.08)", color: "#8b3b9e" },
  "Done":               { bg: "rgba(39,174,96,0.10)",  color: "#27ae60" },
}

export default async function ApproverDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // ── Fetch ALL ECOs that are NOT done ──
  // Show everything pending — not just assigned ones
  const ecos = await prisma.eCO.findMany({
    where: {
      NOT: { stage: "Done" },
    },
    orderBy: { enteredStageAt: "asc" },
    include: {
      product: { select: { name: true, version: true } },
      user:    { select: { loginId: true } },
    },
  })

  const pendingCount  = ecos.length
  const highRiskCount = ecos.filter((e) =>
    ["HIGH","CRITICAL"].includes(e.riskLevel)).length
  const conflictCount = ecos.filter((e) =>
    e.conflictStatus === "CONFLICT").length

  return (
    <div style={{ fontFamily: font }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: "clamp(1.4rem,4vw,1.8rem)",
          fontWeight: 800, margin: 0, color: "#2d1a38",
        }}>
          Approver Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#9b6aab", margin: "4px 0 0", fontWeight: 500 }}>
          {pendingCount} ECO{pendingCount !== 1 ? "s" : ""} pending review
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          {
            label: "Pending Review",
            value: pendingCount,
            icon:  <Clock style={{ width: 18, height: 18, color: "#e07b00" }} />,
            bg:    "rgba(224,123,0,0.07)",
            border:"rgba(224,123,0,0.20)",
          },
          {
            label: "High / Critical Risk",
            value: highRiskCount,
            icon:  <AlertTriangle style={{ width: 18, height: 18, color: "#c62828" }} />,
            bg:    "rgba(198,40,40,0.06)",
            border:"rgba(198,40,40,0.18)",
          },
          {
            label: "With Conflicts",
            value: conflictCount,
            icon:  <AlertTriangle style={{ width: 18, height: 18, color: "#8b3b9e" }} />,
            bg:    "rgba(139,59,158,0.06)",
            border:"rgba(139,59,158,0.18)",
          },
        ].map((s) => (
          <div key={s.label} style={{
            flex: "1 1 160px",
            background:   s.bg,
            border:       `1px solid ${s.border}`,
            borderRadius: 14,
            padding:      "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {s.icon}
              <span style={{ fontSize: 11, color: "#6b4d7a", fontWeight: 700 }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#2d1a38" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ECO Table */}
      <div style={{
        background:   "#fff",
        border:       "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16,
        overflow:     "hidden",
        boxShadow:    "0 2px 12px rgba(139,59,158,0.07)",
      }}>
        <div style={{
          padding:      "14px 20px",
          borderBottom: "1px solid rgba(190,113,209,0.12)",
          background:   "rgba(245,238,250,0.6)",
          display:      "flex",
          justifyContent: "space-between",
          alignItems:   "center",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            All ECOs Awaiting Action
          </p>
          <Link href="/eco" style={{
            fontSize: 12, color: "#8b3b9e", fontWeight: 600, textDecoration: "none",
          }}>
            View all →
          </Link>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "130px 1fr 150px 100px 150px 110px 90px",
          padding:      "8px 20px",
          background:   "rgba(245,238,250,0.4)",
          borderBottom: "1px solid rgba(190,113,209,0.10)",
        }}>
          {["ECO ID","TITLE","PRODUCT","TYPE","STAGE","DATE","RISK"].map((h) => (
            <span key={h} style={{
              fontSize: 10, fontWeight: 800, color: "#9b6aab",
              letterSpacing: "0.07em",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {ecos.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "56px 20px",
          }}>
            <CheckCircle2 style={{
              width: 40, height: 40,
              color: "rgba(139,59,158,0.18)",
              margin: "0 auto 14px", display: "block",
            }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: "#b0a0bc", margin: 0 }}>
              No pending ECOs
            </p>
            <p style={{ fontSize: 12, color: "#c0b0cc", margin: "4px 0 0" }}>
              All ECOs are either done or none have been created yet
            </p>
          </div>
        ) : (
          ecos.map((eco, i) => {
            const stageS      = STAGE_STYLE[eco.stage] ?? { bg: "rgba(139,59,158,0.08)", color: "#8b3b9e" }
            const hasConflict = eco.conflictStatus === "CONFLICT"
            const initials    = eco.user.loginId.slice(0, 2).toUpperCase()
            const isApproval  = eco.stage === "Approval"

            return (
              <Link
                key={eco.id}
                href={isApproval ? `/eco/${eco.id}/approve` : `/eco/${eco.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display:      "grid",
                    gridTemplateColumns: "130px 1fr 150px 100px 150px 110px 90px",
                    padding:      "13px 20px",
                    alignItems:   "center",
                    borderBottom: i < ecos.length - 1
                      ? "1px solid rgba(190,113,209,0.08)"
                      : "none",
                    background:   hasConflict ? "rgba(198,40,40,0.02)" : "transparent",
                    transition:   "background 0.12s",
                    cursor:       "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(245,238,250,0.6)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      hasConflict ? "rgba(198,40,40,0.02)" : "transparent")}
                >
                  {/* ECO ID */}
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#8b3b9e" }}>
                      {(eco as any).ecoNumber || eco.id.slice(0, 8).toUpperCase()}
                    </span>
                    {hasConflict && (
                      <span style={{
                        display: "block", marginTop: 2,
                        fontSize: 9, fontWeight: 800,
                        background: "rgba(198,40,40,0.10)", color: "#c62828",
                        padding: "1px 5px", borderRadius: 4,
                        width: "fit-content",
                      }}>
                        CONFLICT
                      </span>
                    )}
                    {isApproval && (
                      <span style={{
                        display: "block", marginTop: 2,
                        fontSize: 9, fontWeight: 800,
                        background: "rgba(224,123,0,0.12)", color: "#e07b00",
                        padding: "1px 5px", borderRadius: 4,
                        width: "fit-content",
                      }}>
                        NEEDS APPROVAL
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: "#2d1a38",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    paddingRight: 10,
                  }}>
                    {eco.title}
                  </span>

                  {/* Product */}
                  <span style={{ fontSize: 12, color: "#6b4d7a" }}>
                    {eco.product.name}
                    <span style={{ color: "#b0a0bc" }}> v{eco.product.version}</span>
                  </span>

                  {/* Type */}
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px", borderRadius: 20,
                    fontSize: 10, fontWeight: 800,
                    background: "rgba(139,59,158,0.08)", color: "#8b3b9e",
                  }}>
                    {eco.type}
                  </span>

                  {/* Stage */}
                  <span style={{
                    display: "inline-block",
                    padding: "3px 10px", borderRadius: 20,
                    fontSize: 11, fontWeight: 700,
                    background: stageS.bg, color: stageS.color,
                  }}>
                    {eco.stage}
                  </span>

                  {/* Date */}
                  <span style={{ fontSize: 11, color: "#b0a0bc" }}>
                    {format(new Date(eco.createdAt), "dd MMM yyyy")}
                  </span>

                  {/* Risk */}
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: RISK_COLOR[eco.riskLevel] ?? "#8b7aaa",
                  }}>
                    {eco.riskLevel.charAt(0) + eco.riskLevel.slice(1).toLowerCase()}
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
