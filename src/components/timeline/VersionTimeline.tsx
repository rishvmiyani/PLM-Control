"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface Version {
  id: string
  version: number
  status: string
  createdAt: string
  salePrice?: number
  costPrice?: number
}

interface Props {
  versions: Version[]
  isAdmin?: boolean
  onRollback?: (targetId: string) => void
  activeId?: string
}

export default function VersionTimeline({
  versions,
  isAdmin = false,
  onRollback,
  activeId,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)

  const sorted = [...versions].sort((a, b) => a.version - b.version)

  const selected = sorted.find((v) => v.id === selectedId)

  async function handleRollback(id: string) {
    if (!onRollback) return
    setRolling(true)
    await onRollback(id)
    setRolling(false)
  }

  return (
    <div className="space-y-4">
      {/* Horizontal Timeline */}
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {sorted.map((v, i) => {
          const isActive = String(v.status) === "ACTIVE" || v.id === activeId
          const isSelected = v.id === selectedId

          return (
            <div key={v.id} className="flex items-center">
              {/* Node */}
              <button
                onClick={() => setSelectedId(v.id === selectedId ? null : v.id)}
                className="flex flex-col items-center group"
              >
                <div
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100"
                      : isSelected
                      ? "bg-zinc-700 border-zinc-700 text-white"
                      : "bg-white border-zinc-300 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  v{v.version}
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 whitespace-nowrap">
                  {format(new Date(v.createdAt), "dd MMM yy")}
                </p>
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className="text-xs mt-1"
                >
                  {String(v.status)}
                </Badge>
              </button>

              {/* Connector */}
              {i < sorted.length - 1 && (
                <div className="w-16 h-0.5 bg-zinc-200 mx-1 mb-8 shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {/* Inline Diff Panel */}
      {selected && (
        <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-800">
                Version {selected.version} Details
              </h3>
              <p className="text-sm text-zinc-400 mt-0.5">
                {format(new Date(selected.createdAt), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
            <Badge variant={String(selected.status) === "ACTIVE" ? "default" : "secondary"}>
              {String(selected.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {selected.salePrice !== undefined && (
              <div className="bg-zinc-50 rounded-lg p-3">
                <p className="text-xs text-zinc-400 mb-1">Sale Price</p>
                <p className="font-semibold text-zinc-800">
                  ₹{selected.salePrice.toLocaleString()}
                </p>
              </div>
            )}
            {selected.costPrice !== undefined && (
              <div className="bg-zinc-50 rounded-lg p-3">
                <p className="text-xs text-zinc-400 mb-1">Cost Price</p>
                <p className="font-semibold text-zinc-800">
                  ₹{selected.costPrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Rollback button — Admin only, Archived only */}
          {isAdmin && String(selected.status) === "ARCHIVED" && (
            <div className="pt-2 border-t border-zinc-100">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                onClick={() => handleRollback(selected.id)}
                disabled={rolling}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {rolling ? "Creating Rollback ECO..." : `Rollback to v${selected.version}`}
              </Button>
              <p className="text-xs text-zinc-400 mt-1.5">
                Creates a Rollback ECO that goes through approval flow
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
