"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useSLATimer } from "@/hooks/useSLATimer"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

interface ECO {
  id: string
  title: string
  type: string
  riskLevel: string
  riskScore: number
  conflictStatus: string
  createdAt: string
  enteredStageAt: string
  product: { name: string; version: number }
  user: { loginId: string }
}

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700 animate-pulse",
}

const SLA_HOURS_BY_STAGE: Record<string, number> = {
  "New": 24,
  "Engineering Review": 12,
  "Approval": 8,
}

export function KanbanCard({ eco, stage }: { eco: ECO; stage: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: eco.id })

  const slaHours = SLA_HOURS_BY_STAGE[stage] ?? 24
  const sla = useSLATimer(eco.enteredStageAt, slaHours)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      {/* Title + Risk Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/eco/${eco.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-semibold text-zinc-800 line-clamp-2 hover:text-blue-600 transition-colors flex-1"
        >
          {eco.title}
        </Link>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
            RISK_COLORS[eco.riskLevel] ?? "bg-zinc-100 text-zinc-600"
          }`}
        >
          {eco.riskLevel}
        </span>
      </div>

      {/* Product */}
      <p className="text-xs text-zinc-400 mb-2">
        {eco.product.name} v{eco.product.version}
      </p>

      {/* Type + Conflict */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="text-xs">{eco.type}</Badge>
        {eco.conflictStatus === "CONFLICT" && (
          <span className="text-xs text-red-500 font-medium">⚠ Conflict</span>
        )}
      </div>

      {/* SLA Timer */}
      <div
        className={`text-xs font-medium px-2 py-1 rounded-md inline-block ${
          sla.isBreached
            ? "bg-red-100 text-red-600"
            : sla.isWarning
            ? "bg-yellow-100 text-yellow-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {sla.isBreached && "🔴 "}
        {sla.isWarning && !sla.isBreached && "🟡 "}
        {!sla.isWarning && !sla.isBreached && "🟢 "}
        {sla.displayText}
      </div>

      {/* Footer */}
      <p className="text-xs text-zinc-400 mt-2">
        by {eco.user.loginId} · {format(new Date(eco.createdAt), "dd MMM")}
      </p>
    </div>
  )
}
