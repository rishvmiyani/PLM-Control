"use client"

import { useState } from "react"
import Link         from "next/link"
import { format }   from "date-fns"
import { List, LayoutGrid, Plus } from "lucide-react"
import KanbanBoard  from "@/components/dashboard/KanbanBoard"

interface ECO {
  id:             string
  // NO ecoNumber — not in schema
  title:          string
  type:           string   // ECOType enum value
  stage:          string
  riskLevel:      string
  riskScore:      number
  conflictStatus: string
  createdAt:      string
  enteredStageAt: string
  product:        { name: string; version: number }
  user:           { loginId: string }
}

const font = "'DM Sans', sans-serif"

const STAGE_STYLE: Record<string, { bg: string; color: string }> = {
  "New":                { bg: "rgba(139,59,158,0.08)",  color: "#8b3b9e" },
  "Engineering Review": { bg: "rgba(59,122,190,0.10)",  color: "#3b7abe" },
  "Approval":           { bg: "rgba(224,123,0,0.10)",   color: "#e07b00" },
  "Done":               { bg: "rgba(39,174,96,0.10)",   color: "#27ae60" },
}

const RISK_STYLE: Record<string, { color: string }> = {
  LOW:      { color: "#27ae60" },
  MEDIUM:   { color: "#e07b00" },
  HIGH:     { color: "#c62828" },
  CRITICAL: { color: "#c62828" },
}

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  BOM:      { bg: "rgba(139,59,158,0.10)", color: "#8b3b9e" },
  PRODUCT:  { bg: "rgba(59,122,190,0.10)", color: "#3b7abe" },
  ROLLBACK: { bg: "rgba(224,123,0,0.10)",  color: "#e07b00" },
}

const AVATAR_COLORS = ["#8b3b9e","#3b7abe","#27ae60","#e07b00","#e63b6f"]
function avatarColor(s: string) {
  let h = 0
  for (const c of s) h += c.charCodeAt(0)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

// Generate display ID from cuid
function displayId(id: string) {
  return `ECO-${id.slice(-6).toUpperCase()}`
}

export default function ECOPageClient({
  ecos, userRole, userLoginId,
}: {
  ecos:        ECO[]
  userRole:    string
  userLoginId: string
}) {
  const [view, setView] = useState<"list" | "kanban">("list")
  const canCreate = ["ADMIN", "ENGINEERING"].includes(userRole)

  return (
    <div style={{ fontFamily: font }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 24,
      }}>
        <div>
          <h1 style={{
            fontSize: "clamp(1.4rem,4vw,1.8rem)",
            fontWeight: 800, margin: 0, color: "#2d1a38",
          }}>
            Engineering Change Orders
          </h1>
          <p style={{ color: "#9b6aab", fontSize: 13, margin: "4px 0 0", fontWeight: 500 }}>
            {ecos.length} total ECO{ecos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Toggle */}
          <div style={{
            display: "flex", borderRadius: 10,
            border: "1px solid rgba(190,113,209,0.25)", overflow: "hidden",
          }}>
            {(["list", "kanban"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "7px 14px",
                background: view === v
                  ? "linear-gradient(135deg,#8b3b9e,#be71d1)"
                  : "transparent",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                color: view === v ? "#fff" : "#9b6aab",
                fontSize: 12, fontWeight: 700,
                fontFamily: font, transition: "all 0.15s",
              }}>
                {v === "list"
                  ? <><List style={{ width: 13, height: 13 }} /> List</>
                  : <><LayoutGrid style={{ width: 13, height: 13 }} /> Kanban</>
                }
              </button>
            ))}
          </div>

          {canCreate && (
            <Link href="/eco/new" style={{ textDecoration: "none" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 10,
                background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                border: "none", color: "#fff",
                fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: font,
                boxShadow: "0 2px 10px rgba(139,59,158,0.25)",
              }}>
                <Plus style={{ width: 14, height: 14 }} /> New ECO
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div style={{
          background: "#fff",
          border: "1px solid rgba(190,113,209,0.14)",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 2px 12px rgba(139,59,158,0.07)",
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 160px 110px 150px 90px 120px 60px",
            padding: "10px 20px",
            background: "rgba(245,238,250,0.7)",
            borderBottom: "1px solid rgba(190,113,209,0.12)",
          }}>
            {["ECO ID","TITLE","PRODUCT","TYPE","STAGE","RISK","DATE","OWNER"].map((h) => (
              <span key={h} style={{
                fontSize: 10, fontWeight: 800, color: "#9b6aab", letterSpacing: "0.07em",
              }}>
                {h}
              </span>
            ))}
          </div>

          {ecos.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 20px",
              color: "#b0a0bc", fontSize: 13,
            }}>
              No ECOs found. Create your first ECO.
            </div>
          ) : (
            ecos.map((eco, i) => {
              const stageS   = STAGE_STYLE[eco.stage]    ?? STAGE_STYLE["New"]
              const riskS    = RISK_STYLE[eco.riskLevel]  ?? { color: "#8b7aaa" }
              const typeS    = TYPE_STYLE[eco.type]       ?? TYPE_STYLE["BOM"]
              const aColor   = avatarColor(eco.user.loginId)
              const initials = eco.user.loginId.slice(0, 2).toUpperCase()

              return (
                <div
                  key={eco.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 160px 110px 150px 90px 120px 60px",
                    padding: "14px 20px", alignItems: "center",
                    borderBottom: i < ecos.length - 1
                      ? "1px solid rgba(190,113,209,0.08)" : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(245,238,250,0.5)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")}
                >
                  {/* ECO ID — generated from cuid */}
                  <Link href={`/eco/${eco.id}`} style={{ textDecoration: "none" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#8b3b9e" }}>
                      {displayId(eco.id)}
                    </span>
                  </Link>

                  <Link href={`/eco/${eco.id}`} style={{ textDecoration: "none" }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: "#2d1a38",
                      display: "block", paddingRight: 12,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {eco.title}
                    </span>
                  </Link>

                  <span style={{ fontSize: 12, color: "#6b4d7a" }}>
                    {eco.product.name}
                    <span style={{ color: "#b0a0bc" }}> v{eco.product.version}</span>
                  </span>

                  <span style={{
                    display: "inline-block",
                    padding: "3px 10px", borderRadius: 20,
                    fontSize: 10, fontWeight: 800,
                    background: typeS.bg, color: typeS.color,
                  }}>
                    {eco.type}
                  </span>

                  <span style={{
                    display: "inline-block",
                    padding: "4px 12px", borderRadius: 20,
                    fontSize: 11, fontWeight: 700,
                    background: stageS.bg, color: stageS.color,
                  }}>
                    {eco.stage}
                  </span>

                  <span style={{ fontSize: 12, fontWeight: 700, color: riskS.color }}>
                    {eco.riskLevel.charAt(0) + eco.riskLevel.slice(1).toLowerCase()}
                  </span>

                  <span style={{ fontSize: 11, color: "#b0a0bc" }}>
                    {format(new Date(eco.createdAt), "dd MMM yyyy")}
                  </span>

                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: aColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "#fff",
                  }} title={eco.user.loginId}>
                    {initials}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <KanbanBoard
          initialECOs={ecos}
          userRole={userRole}
          userLoginId={userLoginId}
        />
      )}
    </div>
  )
}
