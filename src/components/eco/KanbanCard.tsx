"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useSLATimer } from "@/hooks/useSLATimer"
import { format } from "date-fns"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

interface ECO {
  id:             string
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
  LOW:      { bg: "rgba(39,174,96,0.12)",   color: "#27ae60" },
  MEDIUM:   { bg: "rgba(224,123,0,0.12)",   color: "#e07b00" },
  HIGH:     { bg: "rgba(198,40,40,0.12)",   color: "#c62828" },
  CRITICAL: { bg: "rgba(198,40,40,0.15)",   color: "#c62828" },
}

const STAGE_DOT: Record<string, string> = {
  "New":                "#8b3b9e",
  "Engineering Review": "#8b3b9e",
  "Approval":           "#e07b00",
  "Done":               "#27ae60",
}

const SLA_HOURS_BY_STAGE: Record<string, number> = {
  "New":                24,
  "Engineering Review": 12,
  "Approval":           8,
}

const PROGRESS_COLORS: Record<string, string> = {
  "New":                "#8b3b9e",
  "Engineering Review": "#8b3b9e",
  "Approval":           "#e07b00",
  "Done":               "#27ae60",
}

export function KanbanCard({ eco, stage }: { eco: ECO; stage: string }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: eco.id })

  const slaHours = SLA_HOURS_BY_STAGE[stage] ?? 24
  const sla      = useSLATimer(eco.enteredStageAt, slaHours)

  const riskStyle     = RISK_STYLE[eco.riskLevel] ?? RISK_STYLE["MEDIUM"]
  const progressColor = PROGRESS_COLORS[stage] ?? "#8b3b9e"
  const dotColor      = STAGE_DOT[stage] ?? "#8b3b9e"
  const font          = "'DM Sans', sans-serif"

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0.45 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div style={{
        background:   "#fff",
        border:       "1px solid rgba(190,113,209,0.16)",
        borderRadius: 16,
        padding:      "16px",
        boxShadow:    "0 2px 10px rgba(139,59,158,0.07)",
        cursor:       "grab",
        fontFamily:   font,
        transition:   "box-shadow 0.15s",
        userSelect:   "none",
      }}>

        {/* Stage label above card */}
        <p style={{
          fontSize: 10, fontWeight: 800,
          color: dotColor, letterSpacing: "0.10em",
          margin: "0 0 10px",
          textTransform: "uppercase",
        }}>
          {stage}
        </p>

        {/* Title + Risk badge */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", gap: 10, marginBottom: 4,
        }}>
          <Link
            href={`/eco/${eco.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: 14, fontWeight: 700, color: "#2d1a38",
              textDecoration: "none", flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {eco.title}
          </Link>
          <span style={{
            padding:      "3px 10px",
            borderRadius: 20,
            fontSize:     10,
            fontWeight:   800,
            background:   riskStyle.bg,
            color:        riskStyle.color,
            whiteSpace:   "nowrap",
            flexShrink:   0,
            letterSpacing: "0.04em",
          }}>
            {eco.riskLevel}
          </span>
        </div>

        {/* Product */}
        <p style={{ fontSize: 12, color: "#b0a0bc", margin: "0 0 10px" }}>
          {eco.product.name} v{eco.product.version}
        </p>

        {/* Progress bar */}
        <div style={{
          height: 3, borderRadius: 4,
          background: "rgba(190,113,209,0.12)",
          marginBottom: 12,
        }}>
          <div style={{
            height: "100%", borderRadius: 4,
            width: sla.isBreached ? "100%" : `${Math.min((1 - (sla.percentLeft / 100)) * 100, 100)}%`,
            background: sla.isBreached ? "#c62828" : progressColor,
            transition: "width 1s linear",
          }} />
        </div>

        {/* Type + Conflict */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 12,
        }}>
          <span style={{
            padding:      "3px 10px",
            borderRadius: 20,
            fontSize:     10,
            fontWeight:   600,
            background:   "rgba(139,59,158,0.07)",
            color:        "#8b3b9e",
            border:       "1px solid rgba(190,113,209,0.20)",
          }}>
            {eco.type}
          </span>
          {eco.conflictStatus === "CONFLICT" && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 10px", borderRadius: 20,
              background: "rgba(224,123,0,0.10)",
              border: "1px solid rgba(224,123,0,0.25)",
              fontSize: 10, fontWeight: 700, color: "#e07b00",
            }}>
              <AlertTriangle style={{ width: 9, height: 9 }} />
              Conflict
            </span>
          )}
        </div>

        {/* SLA Timer */}
        <div style={{
          display:      "inline-flex",
          alignItems:   "center",
          gap:          6,
          padding:      "5px 12px",
          borderRadius: 20,
          background:   sla.isBreached
            ? "rgba(198,40,40,0.10)"
            : sla.isWarning
            ? "rgba(224,123,0,0.10)"
            : "rgba(39,174,96,0.10)",
          marginBottom: 12,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: sla.isBreached ? "#c62828"
              : sla.isWarning ? "#e07b00" : "#27ae60",
            flexShrink: 0,
          }} />
          <span style={{
            fontSize:   11,
            fontWeight: 700,
            color:      sla.isBreached ? "#c62828"
              : sla.isWarning ? "#e07b00" : "#27ae60",
          }}>
            {sla.isBreached
              ? `Breached · ${sla.displayText}`
              : sla.displayText}
          </span>
        </div>

        {/* Footer */}
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
        }}>
          <p style={{ fontSize: 11, color: "#b0a0bc", margin: 0 }}>
            {eco.user.loginId} · {format(new Date(eco.createdAt), "dd MMM")}
          </p>
          {eco.riskScore > 0 && (
            <span style={{
              padding:      "3px 10px",
              borderRadius: 20,
              fontSize:     10,
              fontWeight:   800,
              background:   "rgba(139,59,158,0.10)",
              color:        "#8b3b9e",
            }}>
              Score {eco.riskScore}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
