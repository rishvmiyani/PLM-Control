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
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react"

interface ECO {
  id:             string
  ecoNumber:      string
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

const STAGE_CONFIG: Record<string, { dot: string; header: string; count: string }> = {
  "New":                { dot: "#8b3b9e", header: "#2d1a38", count: "rgba(139,59,158,0.12)" },
  "Engineering Review": { dot: "#8b3b9e", header: "#2d1a38", count: "rgba(139,59,158,0.12)" },
  "Approval":           { dot: "#e07b00", header: "#2d1a38", count: "rgba(224,123,0,0.12)"  },
  "Done":               { dot: "#27ae60", header: "#2d1a38", count: "rgba(39,174,96,0.12)"  },
}

const font = "'DM Sans', sans-serif"

const RISK_LEVELS  = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
const TYPES        = ["ALL", "BOM", "PRODUCT", "ROLLBACK", "Design Change"]

export default function KanbanBoard({
  initialECOs, userRole, userLoginId,
}: {
  initialECOs:  ECO[]
  userRole:     string
  userLoginId:  string
}) {
  const [ecos,       setEcos]       = useState<ECO[]>(initialECOs)
  const [activeECO,  setActiveECO]  = useState<ECO | null>(null)
  const [search,     setSearch]     = useState("")
  const [riskFilter, setRiskFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const scrollRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function canDrag(eco: ECO): boolean {
    if (userRole === "ADMIN")       return true
    if (userRole === "ENGINEERING") return eco.user.loginId === userLoginId
    if (userRole === "APPROVER")    return ["Engineering Review", "Approval"].includes(eco.stage)
    return false
  }

  function handleDragStart(event: DragStartEvent) {
    const eco = ecos.find((e) => e.id === event.active.id)
    if (eco) setActiveECO(eco)
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
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
  }, [ecos, userRole, userLoginId])

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" })
  }

  // filtered ecos
  const filtered = ecos.filter(e => {
    if (search     && !e.title.toLowerCase().includes(search.toLowerCase()) &&
                      !e.ecoNumber?.toLowerCase().includes(search.toLowerCase())) return false
    if (riskFilter !== "ALL" && e.riskLevel !== riskFilter) return false
    if (typeFilter !== "ALL" && e.type      !== typeFilter) return false
    return true
  })

  return (
    <div style={{ fontFamily: font }}>

      {/* Filter bar */}
      <div style={{
        display: "flex", gap: 10, alignItems: "center",
        marginBottom: 20, flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 12px", borderRadius: 10,
          border: "1px solid rgba(190,113,209,0.22)",
          background: "#fff", flex: 1, minWidth: 180, maxWidth: 280,
        }}>
          <Search style={{ width: 13, height: 13, color: "#b0a0bc", flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ECOs..."
            style={{
              border: "none", outline: "none", fontSize: 12,
              color: "#2d1a38", background: "transparent",
              fontFamily: font, width: "100%",
            }}
          />
        </div>

        {/* Risk filter */}
        <div style={{ display: "flex", gap: 5 }}>
          {RISK_LEVELS.map(r => (
            <button key={r} onClick={() => setRiskFilter(r)} style={{
              padding: "5px 12px", borderRadius: 20,
              fontSize: 10, fontWeight: 700, cursor: "pointer",
              fontFamily: font,
              background: riskFilter === r ? "linear-gradient(135deg,#8b3b9e,#be71d1)" : "rgba(190,113,209,0.08)",
              color:      riskFilter === r ? "#fff" : "#8b3b9e",
              border:     riskFilter === r ? "none" : "1px solid rgba(190,113,209,0.20)",
            }}>
              {r}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            padding: "7px 12px", borderRadius: 10,
            border: "1px solid rgba(190,113,209,0.22)",
            background: "#fff", fontSize: 12, color: "#6b4d7a",
            fontFamily: font, cursor: "pointer", outline: "none",
          }}
        >
          {TYPES.map(t => <option key={t} value={t}>{t === "ALL" ? "All Types" : t}</option>)}
        </select>
      </div>

      {/* Board wrapper */}
      <div style={{ position: "relative" }}>
        {/* Scroll arrows */}
        {(["left","right"] as const).map(dir => (
          <button key={dir} onClick={() => scroll(dir)} style={{
            position: "absolute",
            [dir]:    -18,
            top:      "50%",
            transform:"translateY(-50%)",
            zIndex:   10,
            width: 34, height: 34, borderRadius: "50%",
            background: "#fff",
            border: "1px solid rgba(190,113,209,0.22)",
            boxShadow: "0 2px 10px rgba(139,59,158,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            {dir === "left"
              ? <ChevronLeft  style={{ width: 15, height: 15, color: "#8b3b9e" }} />
              : <ChevronRight style={{ width: 15, height: 15, color: "#8b3b9e" }} />
            }
          </button>
        ))}

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
              const cfg      = STAGE_CONFIG[stage]
              const stageECOs = filtered.filter((e) => e.stage === stage)

              return (
                <div key={stage} id={stage} style={{ flexShrink: 0, width: 278 }}>

                  {/* Column header */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    padding: "10px 12px",
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid rgba(190,113,209,0.14)",
                    boxShadow: "0 1px 6px rgba(139,59,158,0.05)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: cfg.dot, display: "inline-block",
                        boxShadow: `0 0 0 3px ${cfg.dot}22`,
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: cfg.header }}>
                        {stage}
                      </span>
                    </div>
                    <span style={{
                      minWidth: 22, height: 22, padding: "0 7px",
                      borderRadius: 20,
                      background: cfg.count,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: cfg.dot,
                    }}>
                      {stageECOs.length}
                    </span>
                  </div>

                  {/* Drop zone */}
                  <SortableContext
                    id={stage}
                    items={stageECOs.map((e) => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div style={{
                      minHeight:     96,
                      display:       "flex",
                      flexDirection: "column",
                      gap:           10,
                    }}>
                      {stageECOs.length === 0 ? (
                        <div style={{
                          height:         100,
                          border:         "2px dashed rgba(190,113,209,0.22)",
                          borderRadius:   14,
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                        }}>
                          <p style={{ fontSize: 11, color: "#c0a8d0", fontWeight: 600, margin: 0 }}>
                            Drop here
                          </p>
                        </div>
                      ) : (
                        stageECOs.map((eco) => (
                          <KanbanCard key={eco.id} eco={eco} stage={stage} canDrag={canDrag(eco)} />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {activeECO ? (
              <div style={{ transform: "rotate(1.5deg) scale(1.04)", opacity: 0.92 }}>
                <KanbanCard eco={activeECO} stage={activeECO.stage} canDrag />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
