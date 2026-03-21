"use client"

import { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { Bell, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationPanel } from "@/components/layout/NotificationPanel"
import { useNotificationStore } from "@/store/notifications"

export function TopBar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const { unreadCount, setNotifications } = useNotificationStore()

  useEffect(() => {
    async function fetchNotifications() {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    }
    fetchNotifications()
    // Poll every 60s
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [setNotifications])

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
      <div />

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-zinc-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel open={open} onClose={() => setOpen(false)} />
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 pl-3 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <User className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-zinc-800">
              {session?.user?.loginId}
            </p>
            <p className="text-xs text-zinc-400">{session?.user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}  
            className="ml-1 text-zinc-400 hover:text-red-500"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
