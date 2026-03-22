"use client"

import { useState, useCallback, useRef } from "react"
import {
  DndContext, DragOverlay, closestCorners,
  DragStartEvent, DragEndEvent,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanCard } from "./KanbanCard"
import { useSession } from "next-auth/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ECO {
  id:             string
  title:          string
  type:           string
  stage:          string
  riskLevel:      string
  riskScore:      number
  conflictStatus: string
  createdAt:      string
  enteredStageAt: string
  product:        { name: string; version: number }
  user:           { loginId: string }
}

const STAGES = ["New", "Engineering Review", "Approval", "Done"]

const STAGE_DOT: Record<string, string> = {
  "New":                "#8b3b9e",
  "Engineering Review": "#8b3b9e",
  "Approval":           "#e07b00",
  "Done":               "#27ae60",
}

export default function KanbanBoard({ initialECOs }: { initialECOs: ECO[] }) {
  const { data: session } = useSession()
  const [ecos,      setEcos]      = useState<ECO[]>(initialECOs)
  const [activeECO, setActiveECO] = useState<ECO | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const font = "'DM Sans', sans-serif"

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const role = (session?.user as any)?.role ?? ""

  function canDrag(eco: ECO): boolean {
    if (role === "ADMIN")       return true
    if (role === "ENGINEERING") return eco.user.loginId === (session?.user as any)?.loginId
    if (role === "APPROVER")    return ["Engineering Review", "Approval"].includes(eco.stage)
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
      if (!draggedECO || !canDrag(draggedECO)) return

      const newStage = String(over.id)
      if (!STAGES.includes(newStage) || draggedECO.stage === newStage) return

      const prevEcos = ecos
      setEcos((prev) =>
        prev.map((e) => e.id === draggedECO.id ? { ...e, stage: newStage } : e)
      )

      const res = await fetch(`/api/eco/${draggedECO.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ stage: newStage }),
      })

      if (!res.ok) setEcos(prevEcos)
    },
    [ecos, session]
  )

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" })
    }
  }

  return (
    <div style={{ position: "relative", fontFamily: font }}>

      {/* Scroll Arrows */}
      <button
        onClick={() => scroll("left")}
        style={{
          position: "absolute", left: -18, top: "50%",
          transform: "translateY(-50%)", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff",
          border: "1px solid rgba(190,113,209,0.22)",
          boxShadow: "0 2px 10px rgba(139,59,158,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <ChevronLeft style={{ width: 16, height: 16, color: "#8b3b9e" }} />
      </button>

      <button
        onClick={() => scroll("right")}
        style={{
          position: "absolute", right: -18, top: "50%",
          transform: "translateY(-50%)", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff",
          border: "1px solid rgba(190,113,209,0.22)",
          boxShadow: "0 2px 10px rgba(139,59,158,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <ChevronRight style={{ width: 16, height: 16, color: "#8b3b9e" }} />
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollRef}
          style={{
            display:        "flex",
            gap:            16,
            overflowX:      "auto",
            paddingBottom:  12,
            scrollbarWidth: "none",
          }}
        >
          {STAGES.map((stage) => {
            const stageECOs = ecos.filter((e) => e.stage === stage)

            return (
              <div
                key={stage}
                id={stage}
                style={{ flexShrink: 0, width: 272 }}
              >
                {/* Column Header */}
                <div style={{
                  display:       "flex",
                  alignItems:    "center",
                  justifyContent:"space-between",
                  marginBottom:  12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 9, height: 9, borderRadius: "50%",
                      background: STAGE_DOT[stage] ?? "#8b3b9e",
                      display: "inline-block",
                    }} />
                    <span style={{
                      fontSize: 13, fontWeight: 800, color: "#2d1a38",
                    }}>
                      {stage}
                    </span>
                  </div>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(139,59,158,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "#8b3b9e",
                  }}>
                    {stageECOs.length}
                  </span>
                </div>

                {/* Droppable Column */}
                <SortableContext
                  id={stage}
                  items={stageECOs.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{
                    minHeight:    96,
                    display:      "flex",
                    flexDirection:"column",
                    gap:          10,
                    borderRadius: 14,
                    padding:      stageECOs.length === 0 ? "0" : "0",
                  }}>
                    {stageECOs.length === 0 ? (
                      <div style={{
                        height:         96,
                        border:         "2px dashed rgba(190,113,209,0.25)",
                        borderRadius:   14,
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                      }}>
                        <p style={{
                          fontSize: 12, color: "#c0a8d0",
                          fontWeight: 600, margin: 0,
                        }}>
                          Drop here
                        </p>
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
            <div style={{ transform: "rotate(1.5deg) scale(1.04)", opacity: 0.92 }}>
              <KanbanCard eco={activeECO} stage={activeECO.stage} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
