import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import ECOTableRow from "@/components/eco/ECOTableRow"

export const dynamic = "force-dynamic"

const STAGE_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  "New":                { bg: "#f3f3f3", color: "#555",    border: "rgba(0,0,0,0.1)" },
  "Engineering Review": { bg: "#fff3e0", color: "#e07b00", border: "rgba(224,123,0,0.2)" },
  "Approval":           { bg: "#fff3e0", color: "#e07b00", border: "rgba(224,123,0,0.2)" },
  "Done":               { bg: "#e8f5e9", color: "#2e7d32", border: "rgba(46,125,50,0.2)" },
  "Rejected":           { bg: "#fce4ec", color: "#c62828", border: "rgba(198,40,40,0.2)" },
}

const RISK_COLOR: Record<string, string> = {
  LOW: "#27ae60", MEDIUM: "#8b3b9e", HIGH: "#e07b00", CRITICAL: "#c62828",
}

export default async function ECOListPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      user: { select: { loginId: true } },
    },
  }).catch(() => [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>
            Engineering Change Orders
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#9b6aab", margin: "4px 0 0" }}>
            {ecos.length} total ECOs
          </p>
        </div>
        <Link href="/eco/new">
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 10,
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            color: "#fff", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 14px rgba(139,59,158,0.28)",
          }}>
            <Plus style={{ width: 15, height: 15 }} />
            New ECO
          </button>
        </Link>
      </div>

      {/* Table */}
      <div style={{
        background: "rgba(255,255,255,0.90)",
        border: "1px solid rgba(190,113,209,0.12)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#faf6fd" }}>
              {["ECO ID","TITLE","PRODUCT","TYPE","STAGE","RISK","DATE","OWNER"].map((h) => (
                <th key={h} style={{
                  padding: "12px 20px", textAlign: "left",
                  fontSize: 11, fontWeight: 700,
                  color: "#9b6aab", letterSpacing: "0.07em",
                  borderBottom: "1px solid rgba(190,113,209,0.1)",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ecos.length === 0 ? (
              <tr>
                <td colSpan={8} style={{
                  textAlign: "center", padding: 48,
                  color: "#9b6aab", fontSize: 13,
                }}>
                  No ECOs found.{" "}
                  <Link href="/eco/new" style={{ color: "#8b3b9e", fontWeight: 600 }}>
                    Create one →
                  </Link>
                </td>
              </tr>
            ) : (
              ecos.map((eco, idx) => (
                <ECOTableRow
                  key={eco.id}
                  id={eco.id}
                  ecoCode={`ECO-${String(ecos.length - idx).padStart(4, "0")}`}
                  title={eco.title}
                  productName={eco.product.name}
                  productVersion={eco.product.version}
                  type={eco.type}
                  stage={eco.stage}
                  riskLevel={String(eco.riskLevel)}
                  createdAt={eco.createdAt}
                  ownerLoginId={eco.user.loginId}
                  hasConflict={eco.conflictStatus === "CONFLICT"}
                  badge={STAGE_BADGE[eco.stage] ?? STAGE_BADGE["New"]}
                  riskColor={RISK_COLOR[String(eco.riskLevel)] ?? "#8b3b9e"}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
