"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useNotificationStore } from "@/store/notifications"
import { Bell, X, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

const TYPE_STYLES: Record<string, string> = {
  SLA_BREACH: "bg-red-50 border-red-200 text-red-700",
  CONFLICT_DETECTED: "bg-orange-50 border-orange-200 text-orange-700",
  ECO_CREATED: "bg-blue-50 border-blue-200 text-blue-700",
  APPROVED: "bg-green-50 border-green-200 text-green-700",
  REJECTED: "bg-zinc-50 border-zinc-200 text-zinc-600",
}

const TYPE_ICONS: Record<string, string> = {
  SLA_BREACH: "🔴",
  CONFLICT_DETECTED: "⚠️",
  ECO_CREATED: "📋",
  APPROVED: "✅",
  REJECTED: "❌",
}

export function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, markRead, markAllRead } = useNotificationStore()

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, onClose])

  async function handleMarkRead(id: string) {
    markRead(id)
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
  }

  async function handleMarkAll() {
    markAllRead()
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    })
  }

  function handleNavigate(ecoId: string, notifId: string) {
    handleMarkRead(notifId)
    router.push(`/eco/${ecoId}`)
    onClose()
  }

  if (!open) return null

  const grouped = notifications.reduce<Record<string, typeof notifications>>(
    (acc, n) => {
      const key = n.type
      acc[key] = acc[key] ?? []
      acc[key].push(n)
      return acc
    },
    {}
  )

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-96 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <p className="font-semibold text-zinc-800 text-sm">Notifications</p>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <Bell className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <p className="px-4 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide bg-zinc-50 border-b border-zinc-100">
                {TYPE_ICONS[type] ?? "•"} {type.replace(/_/g, " ")}
              </p>
              {items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNavigate(n.ecoId, n.id)}
                  className={`px-4 py-3 border-b border-zinc-50 cursor-pointer hover:bg-zinc-50 transition-colors ${
                    !n.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-zinc-700">{n.message}</p>
                      {n.eco?.title && (
                        <p className="text-xs text-zinc-400 mt-0.5 truncate">
                          {n.eco.title}
                        </p>
                      )}
                      <p className="text-xs text-zinc-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
