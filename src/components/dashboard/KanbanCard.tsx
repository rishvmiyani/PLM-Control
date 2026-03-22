"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS }         from "@dnd-kit/utilities"
import { useSLATimer } from "@/hooks/useSLATimer"
import { format }      from "date-fns"
import Link            from "next/link"
import { AlertTriangle } from "lucide-react"

interface ECO {
  id:             string
  ecoNumber:      string
  title:          string
  type:           string
  riskLevel:      string
  riskScore:      number
  conflictStatus: string
  createdAt:      string
  enteredStageAt: string
  product:        { name: string; version: number }
  user:           { loginId: string }
}

const RISK_STYLE: Record<string, { bg: string; color: string }> = {
  LOW:      { bg: "rgba(39,174,96,0.12)",  color: "#27ae60" },
  MEDIUM:   { bg: "rgba(224,123,0,0.12)",  color: "#e07b00" },
  HIGH:     { bg: "rgba(198,40,40,0.12)",  color: "#c62828" },
  CRITICAL: { bg: "rgba(198,40,40,0.15)",  color: "#c62828" },
}

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  BOM:            { bg: "rgba(139,59,158,0.10)",  color: "#8b3b9e" },
  PRODUCT:        { bg: "rgba(59,122,190,0.10)",  color: "#3b7abe" },
  ROLLBACK:       { bg: "rgba(224,123,0,0.10)",   color: "#e07b00" },
  "Design Change":{ bg: "rgba(230,59,111,0.10)",  color: "#e63b6f" },
}

const SLA_HOURS: Record<string, number> = {
  "New": 24, "Engineering Review": 12, "Approval": 8,
}

const font = "'DM Sans', sans-serif"

// Initials avatar colors
const AVATAR_COLORS = ["#8b3b9e","#3b7abe","#27ae60","#e07b00","#e63b6f"]
function avatarColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h += str.charCodeAt(i)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export function KanbanCard({
  eco, stage, canDrag,
}: {
  eco: ECO; stage: string; canDrag: boolean
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: eco.id, disabled: !canDrag })

  const slaHours = SLA_HOURS[stage] ?? 24
  const sla      = useSLATimer(eco.enteredStageAt, slaHours)

  const riskStyle = RISK_STYLE[eco.riskLevel] ?? RISK_STYLE["LOW"]
  const typeStyle = TYPE_STYLE[eco.type]      ?? TYPE_STYLE["BOM"]
  const initials  = eco.user.loginId.slice(0, 2).toUpperCase()
  const aColor    = avatarColor(eco.user.loginId)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{
        background:   "#fff",
        border:       "1px solid rgba(190,113,209,0.16)",
        borderRadius: 14,
        padding:      "14px",
        boxShadow:    "0 2px 10px rgba(139,59,158,0.07)",
        cursor:       canDrag ? "grab" : "default",
        fontFamily:   font,
        userSelect:   "none",
      }}>

        {/* ECO number + risk */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 8,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 800, color: "#8b3b9e",
            letterSpacing: "0.04em",
          }}>
            {eco.ecoNumber ?? eco.id.slice(0,8).toUpperCase()}
          </span>
          <span style={{
            padding: "2px 9px", borderRadius: 20,
            fontSize: 9, fontWeight: 800,
            background: riskStyle.bg, color: riskStyle.color,
            letterSpacing: "0.05em",
          }}>
            {eco.riskLevel}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/eco/${eco.id}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: 13, fontWeight: 700, color: "#2d1a38",
            textDecoration: "none",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            marginBottom: 6,
            display: "block",
          } as React.CSSProperties}
        >
          {eco.title}
        </Link>

        {/* Product */}
        <p style={{ fontSize: 11, color: "#b0a0bc", margin: "0 0 10px" }}>
          {eco.product.name} v{eco.product.version}
        </p>

        {/* Progress bar */}
        <div style={{
          height: 3, borderRadius: 4,
          background: "rgba(190,113,209,0.12)", marginBottom: 10,
        }}>
          <div style={{
            height: "100%", borderRadius: 4,
            width: sla.isBreached ? "100%" : `${Math.min(100 - (sla.percentLeft ?? 100), 100)}%`,
            background: sla.isBreached ? "#c62828"
              : sla.isWarning ? "#e07b00" : "#8b3b9e",
            transition: "width 1s linear",
          }} />
        </div>

        {/* Type + Conflict badges */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 10,
        }}>
          <span style={{
            padding: "3px 10px", borderRadius: 20,
            fontSize: 10, fontWeight: 700,
            background: typeStyle.bg, color: typeStyle.color,
          }}>
            {eco.type}
          </span>
          {eco.conflictStatus === "CONFLICT" && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 9px", borderRadius: 20,
              background: "rgba(224,123,0,0.10)",
              border: "1px solid rgba(224,123,0,0.25)",
              fontSize: 9, fontWeight: 800, color: "#e07b00",
            }}>
              <AlertTriangle style={{ width: 9, height: 9 }} /> Conflict
            </span>
          )}
        </div>

        {/* SLA timer */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 11px", borderRadius: 20, marginBottom: 10,
          background: sla.isBreached ? "rgba(198,40,40,0.10)"
            : sla.isWarning ? "rgba(224,123,0,0.10)"
            : "rgba(39,174,96,0.10)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: sla.isBreached ? "#c62828"
              : sla.isWarning ? "#e07b00" : "#27ae60",
          }} />
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: sla.isBreached ? "#c62828"
              : sla.isWarning ? "#e07b00" : "#27ae60",
          }}>
            {sla.isBreached ? `Breached · ${sla.displayText}` : sla.displayText}
          </span>
        </div>

        {/* Footer: avatar + date + score */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: aColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, color: "#fff",
            }}>
              {initials}
            </div>
            <span style={{ fontSize: 10, color: "#b0a0bc" }}>
              {eco.user.loginId} · {format(new Date(eco.createdAt), "dd MMM")}
            </span>
          </div>
          {eco.riskScore > 0 && (
            <span style={{
              padding: "2px 9px", borderRadius: 20,
              fontSize: 9, fontWeight: 800,
              background: "rgba(139,59,158,0.09)", color: "#8b3b9e",
            }}>
              Score {eco.riskScore}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
