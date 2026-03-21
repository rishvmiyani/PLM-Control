"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanCard } from "./KanbanCard"
import { useSession } from "next-auth/react"

interface ECO {
  id: string
  title: string
  type: string
  stage: string
  riskLevel: string
  riskScore: number
  conflictStatus: string
  createdAt: string
  enteredStageAt: string
  product: { name: string; version: number }
  user: { loginId: string }
}

const STAGES = ["New", "Engineering Review", "Approval", "Done"]

const STAGE_COLORS: Record<string, string> = {
  "New": "bg-zinc-100 text-zinc-700",
  "Engineering Review": "bg-blue-100 text-blue-700",
  "Approval": "bg-yellow-100 text-yellow-700",
  "Done": "bg-green-100 text-green-700",
}

export default function KanbanBoard({ initialECOs }: { initialECOs: ECO[] }) {
  const { data: session } = useSession()
  const [ecos, setEcos] = useState<ECO[]>(initialECOs)
  const [activeECO, setActiveECO] = useState<ECO | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const role = session?.user?.role ?? ""

  function canDrag(eco: ECO): boolean {
    if (role === "ADMIN") return true
    if (role === "ENGINEERING") return eco.user.loginId === session?.user?.loginId
    if (role === "APPROVER") return ["Engineering Review", "Approval"].includes(eco.stage)
    return false
  }

  function handleDragStart(event: DragStartEvent) {
    const eco = ecos.find((e) => e.id === event.active.id)
    if (eco) setActiveECO(eco)
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveECO(null)
      const { active, over } = event
      if (!over) return

      const draggedECO = ecos.find((e) => e.id === active.id)
      if (!draggedECO) return
      if (!canDrag(draggedECO)) return

      const newStage = String(over.id)
      if (!STAGES.includes(newStage)) return
      if (draggedECO.stage === newStage) return

      // Optimistic update
      const prevEcos = ecos
      setEcos((prev) =>
        prev.map((e) =>
          e.id === draggedECO.id ? { ...e, stage: newStage } : e
        )
      )

      // API call
      const res = await fetch(`/api/eco/${draggedECO.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!res.ok) {
        // Revert on failure
        setEcos(prevEcos)
        console.error("Stage update failed")
      }
    },
    [ecos, session]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageECOs = ecos.filter((e) => e.stage === stage)
          return (
            <div
              key={stage}
              id={stage}
              className="flex-shrink-0 w-72"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLORS[stage]}`}>
                    {stage}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    {stageECOs.length}
                  </span>
                </div>
              </div>

              {/* Droppable Column */}
              <SortableContext
                id={stage}
                items={stageECOs.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={`min-h-24 space-y-3 rounded-xl p-2 transition-colors ${
                    stageECOs.length === 0
                      ? "border-2 border-dashed border-zinc-200"
                      : ""
                  }`}
                >
                  {stageECOs.length === 0 ? (
                    <div className="h-16 flex items-center justify-center">
                      <p className="text-xs text-zinc-400">Drop here</p>
                    </div>
                  ) : (
                    stageECOs.map((eco) => (
                      <KanbanCard key={eco.id} eco={eco} stage={stage} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          )
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeECO ? (
          <div className="opacity-90 rotate-1 scale-105">
            <KanbanCard eco={activeECO} stage={activeECO.stage} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
