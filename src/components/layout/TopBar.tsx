"use client"

import { useState } from "react"
import { Menu, Plus, Search, List, LayoutGrid, Bell, ChevronDown, LogOut } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

interface Props {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

function TopBar({ onToggleSidebar, sidebarOpen }: Props) {
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header style={{
      position: "fixed", top: 0,
      left: sidebarOpen ? 200 : 0,
      right: 0, height: 56,
      zIndex: 30,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(190,113,209,0.12)",
      display: "flex", alignItems: "center",
      gap: 12, padding: "0 20px",
      transition: "left 0.3s",
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: "none", border: "none",
          cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#6b4d7a",
        }}
      >
        <Menu style={{ width: 18, height: 18 }} />
      </button>

      {/* New ECO button */}
      <Link href="/eco/new" style={{ textDecoration: "none" }}>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 10,
          background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
          color: "#fff", border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 4px 14px rgba(187, 62, 218, 0.3)",
        }}>
          <Plus style={{ width: 15, height: 15 }} />
          New ECO
        </button>
      </Link>

      {/* Search bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        flex: 1, maxWidth: 360,
        background: "#f5f0f9",
        border: "1px solid rgba(190,113,209,0.18)",
        borderRadius: 10, padding: "0 14px", height: 36,
      }}>
        <Search style={{ width: 14, height: 14, color: "#9b6aab", flexShrink: 0 }} />
        <input
          placeholder="Search orders, products, BOMs..."
          style={{
            flex: 1, background: "none", border: "none",
            outline: "none", fontSize: 13, color: "#3b1a47",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* View toggle */}
      <div style={{
        display: "flex", alignItems: "center",
        background: "#f5f0f9",
        border: "1px solid rgba(190,113,209,0.18)",
        borderRadius: 10, padding: 3, gap: 2,
      }}>
        {([
          { mode: "list" as const, icon: <List style={{ width: 15, height: 15 }} /> },
          { mode: "kanban" as const, icon: <LayoutGrid style={{ width: 15, height: 15 }} /> },
        ]).map(({ mode, icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: viewMode === mode
                ? "linear-gradient(135deg,#8b3b9e,#be71d1)"
                : "transparent",
              color: viewMode === mode ? "#fff" : "#9b6aab",
              transition: "all 0.18s",
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Profile */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {session?.user?.loginId?.slice(0, 2).toUpperCase() ?? "U"}
        </button>

        {profileOpen && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            width: 200, borderRadius: 14, overflow: "hidden", zIndex: 50,
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(190,113,209,0.15)",
            boxShadow: "0 8px 32px rgba(139,59,158,0.15)",
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(190,113,209,0.1)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#2d1a38", margin: 0 }}>
                {session?.user?.loginId}
              </p>
              <p style={{ fontSize: 11, color: "#9b6aab", margin: "2px 0 0" }}>
                {session?.user?.role}
              </p>
            </div>
            <div style={{ padding: 6 }}>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "8px 10px", borderRadius: 8,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, color: "#e63b6f",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default TopBar
