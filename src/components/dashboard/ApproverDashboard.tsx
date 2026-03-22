import { auth }     from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma }   from "@/lib/prisma"
import Link         from "next/link"
import { format }   from "date-fns"
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import ApproveRejectButtons from "@/components/eco/ApproveRejectButtons"

function displayId(id: string) {
  return `ECO-${id.slice(-6).toUpperCase()}`
}

const RISK_COLOR: Record<string, string> = {
  LOW: "#27ae60", MEDIUM: "#e07b00", HIGH: "#c62828", CRITICAL: "#c62828",
}

export default async function ApproverDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    where:   { stage: "Approval" },
    orderBy: { enteredStageAt: "asc" },
    include: {
      product: { select: { name: true, version: true } },
      user:    { select: { loginId: true } },
    },
  })

  const total        = ecos.length
  const highRisk     = ecos.filter((e) => ["HIGH","CRITICAL"].includes(e.riskLevel)).length
  const withConflict = ecos.filter((e) => e.conflictStatus === "CONFLICT").length

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(1.4rem,4vw,1.8rem)", fontWeight: 800, margin: 0, color: "#2d1a38" }}>
          Approver Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#9b6aab", margin: "4px 0 0", fontWeight: 500 }}>
          {total} ECO{total !== 1 ? "s" : ""} awaiting your approval
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Awaiting Approval", value: total,        icon: <Clock         style={{ width: 18, height: 18, color: "#e07b00" }} />, bg: "rgba(224,123,0,0.07)",  border: "rgba(224,123,0,0.20)"  },
          { label: "High / Critical",   value: highRisk,     icon: <AlertTriangle style={{ width: 18, height: 18, color: "#c62828" }} />, bg: "rgba(198,40,40,0.06)",  border: "rgba(198,40,40,0.18)"  },
          { label: "With Conflicts",    value: withConflict, icon: <AlertTriangle style={{ width: 18, height: 18, color: "#8b3b9e" }} />, bg: "rgba(139,59,158,0.06)", border: "rgba(139,59,158,0.18)" },
        ].map((s) => (
          <div key={s.label} style={{
            flex: "1 1 160px", background: s.bg,
            border: `1px solid ${s.border}`, borderRadius: 14, padding: "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {s.icon}
              <span style={{ fontSize: 11, color: "#6b4d7a", fontWeight: 700 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#2d1a38" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "#fff", border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(139,59,158,0.07)",
      }}>
        {/* Header bar */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid rgba(190,113,209,0.12)",
          background: "rgba(245,238,250,0.6)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            Pending Approval
          </p>
          <Link href="/eco" style={{ fontSize: 12, color: "#8b3b9e", fontWeight: 600, textDecoration: "none" }}>
            View all ECOs →
          </Link>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "130px 1fr 150px 90px 100px 80px 190px",
          padding: "8px 20px",
          background: "rgba(245,238,250,0.4)",
          borderBottom: "1px solid rgba(190,113,209,0.10)",
        }}>
          {["ECO ID","TITLE","PRODUCT","TYPE","DATE","RISK","ACTIONS"].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 800, color: "#9b6aab", letterSpacing: "0.07em" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {ecos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 20px" }}>
            <CheckCircle2 style={{ width: 40, height: 40, color: "rgba(139,59,158,0.18)", margin: "0 auto 14px", display: "block" }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: "#b0a0bc", margin: 0 }}>
              No ECOs awaiting approval
            </p>
            <p style={{ fontSize: 12, color: "#c0b0cc", margin: "4px 0 0" }}>
              When engineers submit ECOs for approval, they will appear here
            </p>
          </div>
        ) : (
          ecos.map((eco, i) => (
            <div
              key={eco.id}
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr 150px 90px 100px 80px 190px",
                padding: "13px 20px", alignItems: "center",
                borderBottom: i < ecos.length - 1
                  ? "1px solid rgba(190,113,209,0.08)" : "none",
              }}
            >
              {/* ECO ID */}
              <Link href={`/eco/${eco.id}`} style={{ textDecoration: "none" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#8b3b9e" }}>
                    {displayId(eco.id)}
                  </span>
                  <span style={{
                    display: "block", marginTop: 2, fontSize: 9, fontWeight: 800,
                    background: "rgba(224,123,0,0.12)", color: "#e07b00",
                    padding: "1px 6px", borderRadius: 4, width: "fit-content",
                  }}>
                    NEEDS APPROVAL
                  </span>
                </div>
              </Link>

              {/* Title */}
              <Link href={`/eco/${eco.id}`} style={{ textDecoration: "none" }}>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: "#2d1a38",
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap", paddingRight: 12, display: "block",
                }}>
                  {eco.title}
                </span>
              </Link>

              {/* Product */}
              <span style={{ fontSize: 12, color: "#6b4d7a" }}>
                {eco.product.name}
                <span style={{ color: "#b0a0bc" }}> v{eco.product.version}</span>
              </span>

              {/* Type */}
              <span style={{
                display: "inline-block", padding: "2px 8px",
                borderRadius: 20, fontSize: 10, fontWeight: 800,
                background: "rgba(139,59,158,0.08)", color: "#8b3b9e",
                width: "fit-content",
              }}>
                {eco.type}
              </span>

              {/* Date */}
              <span style={{ fontSize: 11, color: "#b0a0bc" }}>
                {format(new Date(eco.createdAt), "dd MMM yyyy")}
              </span>

              {/* Risk */}
              <span style={{ fontSize: 12, fontWeight: 700, color: RISK_COLOR[eco.riskLevel] ?? "#8b7aaa" }}>
                {eco.riskLevel.charAt(0) + eco.riskLevel.slice(1).toLowerCase()}
              </span>

              {/* ACTIONS — Approve / Reject buttons */}
              <ApproveRejectButtons ecoId={eco.id} />

            </div>
          ))
        )}
      </div>
    </div>
  )
}
