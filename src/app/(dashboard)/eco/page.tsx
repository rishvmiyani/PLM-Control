"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, LayoutGrid, Table2 } from "lucide-react"
import { format } from "date-fns"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const KanbanBoard = dynamic(
  () => import("@/components/eco/KanbanBoard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ))}
      </div>
    ),
  }
)

interface ECO {
  id: string
  title: string
  type: string
  stage: string
  riskScore: number
  riskLevel: string
  conflictStatus: string
  createdAt: string
  effectiveDate: string
  product: { name: string; version: number }
  user: { loginId: string }
}

const STAGE_COLORS: Record<string, string> = {
  "New": "bg-zinc-100 text-zinc-700",
  "Engineering Review": "bg-blue-100 text-blue-700",
  "Approval": "bg-yellow-100 text-yellow-700",
  "Done": "bg-green-100 text-green-700",
  "Rejected": "bg-red-100 text-red-700",
}

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700 animate-pulse",
}

const STAGES = ["New", "Engineering Review", "Approval", "Done", "Rejected"]

export default function ECOListPage() {
  const [ecos, setEcos] = useState<ECO[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"kanban" | "table">("kanban")

  useEffect(() => {
    const saved = localStorage.getItem("eco-view-preference")
    if (saved === "table" || saved === "kanban") setView(saved)
    fetchECOs()
  }, [])

  async function fetchECOs() {
    setLoading(true)
    const res = await fetch("/api/eco")
    if (res.ok) setEcos(await res.json())
    setLoading(false)
  }

  function switchView(v: "kanban" | "table") {
    setView(v)
    localStorage.setItem("eco-view-preference", v)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Engineering Change Orders</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{ecos.length} total ECOs</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
            <button
              onClick={() => switchView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                view === "kanban"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => switchView("table")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                view === "table"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Table2 className="w-4 h-4" /> Table
            </button>
          </div>
          <Link href="/eco/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New ECO
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Kanban View */}
      {!loading && view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageECOs = ecos.filter((e) => e.stage === stage)
            return (
              <div key={stage} className="flex-shrink-0 w-72">
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

                {/* Cards */}
                <div className="space-y-3 min-h-24">
                  {stageECOs.length === 0 ? (
                    <div className="border-2 border-dashed border-zinc-200 rounded-xl h-20 flex items-center justify-center">
                      <p className="text-xs text-zinc-400">No ECOs</p>
                    </div>
                  ) : (
                    stageECOs.map((eco) => (
                      <Link key={eco.id} href={`/eco/${eco.id}`}>
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group">
                          {/* Risk Badge top-right */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-zinc-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {eco.title}
                            </p>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${RISK_COLORS[eco.riskLevel] ?? "bg-zinc-100 text-zinc-600"}`}>
                              {eco.riskLevel}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 mb-3">
                            {eco.product.name} v{eco.product.version}
                          </p>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {eco.type}
                            </Badge>
                            {eco.conflictStatus === "CONFLICT" && (
                              <span className="text-xs text-red-500 font-medium">
                                ⚠ Conflict
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 mt-2">
                            by {eco.user.loginId} · {format(new Date(eco.createdAt), "dd MMM")}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table View */}
      {!loading && view === "table" && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Stage</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Risk</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">By</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Effective</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {ecos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-zinc-400 py-12">
                    No ECOs yet.{" "}
                    <Link href="/eco/new" className="text-blue-600 hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                ecos.map((eco) => (
                  <tr key={eco.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-800 max-w-48 truncate">
                      {eco.title}
                      {eco.conflictStatus === "CONFLICT" && (
                        <span className="ml-2 text-xs text-red-500">⚠</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {eco.product.name}{" "}
                      <span className="text-zinc-400">v{eco.product.version}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{eco.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLORS[eco.stage] ?? "bg-zinc-100"}`}>
                        {eco.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${RISK_COLORS[eco.riskLevel] ?? "bg-zinc-100"}`}>
                        {eco.riskLevel} · {eco.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{eco.user.loginId}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {format(new Date(eco.effectiveDate), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/eco/${eco.id}`}>
                        <Button variant="ghost" size="sm">View →</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
