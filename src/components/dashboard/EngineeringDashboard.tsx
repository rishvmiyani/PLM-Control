import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { differenceInHours } from "date-fns"
import {
  GitPullRequest, CheckCircle2,
  AlertTriangle, Plus, Clock,
} from "lucide-react"
import ECOTable from "@/components/dashboard/ECOTable"

const SLA_HOURS = 5

export default async function EngineeringDashboard() {
  const session = await auth()
  if (!session) return null

  const myECOs = await prisma.eCO.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      product: { select: { name: true, version: true } },
      user:    { select: { loginId: true } },
    },
  })

  const openCount = myECOs.filter(
    (e) => e.stage !== "Done" && e.stage !== "Rejected"
  ).length

  const doneCount = myECOs.filter((e) => e.stage === "Done").length

  const breachedCount = myECOs.filter((e) => {
    if (e.stage === "Done" || e.stage === "Rejected") return false
    return differenceInHours(new Date(), e.enteredStageAt) >= SLA_HOURS
  }).length

  const font = "'DM Sans', sans-serif"

  const serializedECOs = myECOs.map((e) => ({
    id:             e.id,
    title:          e.title,
    stage:          e.stage,
    riskLevel:      e.riskLevel,
    riskScore:      e.riskScore,
    conflictStatus: e.conflictStatus,
    createdAt:      e.createdAt.toISOString(),
    enteredStageAt: e.enteredStageAt.toISOString(),
    product: {
      name:    e.product.name,
      version: e.product.version,
    },
  }))

  return (
    <div style={{ fontFamily: font, maxWidth: 900, padding: "0 4px" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 20, flexWrap: "wrap", gap: 14,
      }}>
        <div>
          <h1 style={{
            fontSize: "clamp(1.5rem,4vw,2rem)",
            fontWeight: 800, margin: 0, lineHeight: 1.2,
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Welcome, {session.user.loginId}
          </h1>
          <p style={{ color: "#9b6aab", fontSize: 13, margin: "4px 0 0", fontWeight: 600 }}>
            Engineering Dashboard
          </p>
        </div>
        <Link href="/eco/new" style={{ textDecoration: "none" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 11, border: "none",
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            fontFamily: font, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(139,59,158,0.28)",
          }}>
            <Plus style={{ width: 14, height: 14 }} /> New ECO
          </button>
        </Link>
      </div>

      {/* ── SLA Breach Alert ── */}
      {breachedCount > 0 && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: "rgba(224,123,0,0.07)",
          border: "1px solid rgba(224,123,0,0.25)",
          borderRadius: 12, padding: "12px 16px",
          marginBottom: 20,
        }}>
          <AlertTriangle style={{
            width: 16, height: 16, color: "#e07b00",
            flexShrink: 0, marginTop: 1,
          }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#b85c00", margin: 0 }}>
              {breachedCount} ECO{breachedCount > 1 ? "s" : ""} have breached SLA
            </p>
            <p style={{ fontSize: 11, color: "#c97a20", margin: "2px 0 0" }}>
              These ECOs have exceeded the {SLA_HOURS}-hour approval window.
            </p>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 14, marginBottom: 24,
      }}>

        {/* Open ECOs */}
        <div style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(190,113,209,0.18)",
          borderRadius: 16, padding: "20px 16px",
          boxShadow: "0 4px 18px rgba(139,59,158,0.07)",
          textAlign: "center",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: "0 auto 12px",
            background: "rgba(139,59,158,0.09)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Clock style={{ width: 20, height: 20, color: "#8b3b9e" }} />
          </div>
          <p style={{ fontSize: 30, fontWeight: 800, color: "#2d1a38", margin: 0, lineHeight: 1 }}>
            {openCount}
          </p>
          <p style={{ fontSize: 11, color: "#9b6aab", margin: "5px 0 0", fontWeight: 600 }}>
            Open ECOs
          </p>
        </div>

        {/* SLA Breached */}
        <div style={{
          background: breachedCount > 0
            ? "rgba(224,123,0,0.06)" : "rgba(255,255,255,0.92)",
          border: breachedCount > 0
            ? "1px solid rgba(224,123,0,0.28)"
            : "1px solid rgba(190,113,209,0.18)",
          borderRadius: 16, padding: "20px 16px",
          boxShadow: "0 4px 18px rgba(139,59,158,0.07)",
          textAlign: "center",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: "0 auto 12px",
            background: "rgba(224,123,0,0.10)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle style={{ width: 20, height: 20, color: "#e07b00" }} />
          </div>
          <p style={{
            fontSize: 30, fontWeight: 800, margin: 0, lineHeight: 1,
            color: breachedCount > 0 ? "#e07b00" : "#2d1a38",
          }}>
            {breachedCount}
          </p>
          <p style={{ fontSize: 11, color: "#9b6aab", margin: "5px 0 0", fontWeight: 600 }}>
            SLA Breached
          </p>
        </div>

        {/* Total Approved */}
        <div style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(190,113,209,0.18)",
          borderRadius: 16, padding: "20px 16px",
          boxShadow: "0 4px 18px rgba(139,59,158,0.07)",
          textAlign: "center",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: "0 auto 12px",
            background: "rgba(39,174,96,0.09)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle2 style={{ width: 20, height: 20, color: "#27ae60" }} />
          </div>
          <p style={{ fontSize: 30, fontWeight: 800, color: "#2d1a38", margin: 0, lineHeight: 1 }}>
            {doneCount}
          </p>
          <p style={{ fontSize: 11, color: "#9b6aab", margin: "5px 0 0", fontWeight: 600 }}>
            Total Approved
          </p>
        </div>

      </div>

      {/* ── ECO Table (Client Component) ── */}
      <ECOTable ecos={serializedECOs} slaHours={SLA_HOURS} />

    </div>
  )
}
