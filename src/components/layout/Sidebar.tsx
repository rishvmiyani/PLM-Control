"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GitPullRequest, Package, ListTree,
  BarChart3, Settings, ChevronDown,
  ChevronRight, Layers, LayoutDashboard,
} from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"

const NAV = [
  {
    label: "Engineering Change Order",
    href: "/eco",
    icon: <GitPullRequest className="w-4 h-4" />,
  },
  {
    label: "Master Data",
    icon: <Layers className="w-4 h-4" />,
    children: [
      { label: "Bills of Material", href: "/bom" },
      { label: "Products", href: "/products" },
    ],
  },
  {
    label: "Reporting",
    href: "/reports",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
    children: [
      { label: "ECO's Stage", href: "/settings/stages" },
    ],
  },
]

interface Props { isOpen: boolean }

function Sidebar({ isOpen }: Props) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expanded, setExpanded] = useState<string[]>(["Master Data", "Settings"])

  const toggle = (label: string) =>
    setExpanded((p) => p.includes(label) ? p.filter((l) => l !== label) : [...p, label])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const initials = session?.user?.loginId?.slice(0, 2).toUpperCase() ?? "U"

  return (
    <aside
<<<<<<< HEAD
className="sidebar fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300"
      style={{ width: isOpen ? 240 : 0, overflow: "hidden" }}
    >
      <div style={{ width: 240 }} className="flex flex-col h-full">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 py-5 border-b"
          style={{ borderColor: "rgba(139,59,158,0.1)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#8b3b9e,#be71d1)" }}
          >
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--deep)", lineHeight: 1.2 }}
            >
              PLM Platform
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--text-sub)" }}
            >
              Intelligence
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map((item) => {
            if (item.children) {
              const isExpanded = expanded.includes(item.label)
              const anyChildActive = item.children.some((c) => isActive(c.href))

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    className={`nav-item w-full justify-between ${
                      anyChildActive ? "active" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {item.icon}
                      {item.label}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-0.5 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`nav-item nav-sub ${
                            isActive(child.href) ? "active" : ""
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
        return (
              <Link
                key={item.href}
                href={item.href!}
                className={nav-item ${isActive(item.href!) ? "active" : ""}}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

      {/* Role badge */}
      {!collapsed && (
        <div className="p-3 border-t border-zinc-100">
          <div className="bg-zinc-50 rounded-lg px-3 py-2">
            <p className="text-xs text-zinc-400">Signed in as</p>
            <p className="text-xs font-semibold text-zinc-700 mt-0.5">
              {session?.user?.loginId}
=======
      style={{
        position: "fixed", top: 0, left: 0, height: "100%",
        width: isOpen ? 200 : 0, overflow: "hidden",
        zIndex: 40, transition: "width 0.3s",
        background: "#f5eefa",
        borderRight: "1px solid rgba(190,113,209,0.15)",
        display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ width: 200, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "18px 16px 16px",
          borderBottom: "1px solid rgba(190,113,209,0.12)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Layers style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#2d1a38", lineHeight: 1.2 }}>
              EcoFlow PLM
>>>>>>> beed07c (add new files and updates)
            </p>
            <p style={{ fontSize: 10, color: "#9b6aab" }}>Product Lifecycle</p>
          </div>
        </div>

<<<<<<< HEAD
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="h-10 flex items-center justify-center border-t border-zinc-100 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

        {/* Bottom */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "rgba(139,59,158,0.1)" }}
        >
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-sub)", opacity: 0.5 }}
          >
            PLM v1.0
          </p>
        </div>
      </div>
    </aside>
  )
}
=======
        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {NAV.map((item) => {
            if (item.children) {
              const isExp = expanded.includes(item.label)
              const anyActive = item.children.some((c) => isActive(c.href))
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%", padding: "9px 10px",
                      borderRadius: 10, border: "none",
                      background: anyActive ? "rgba(139,59,158,0.08)" : "transparent",
                      color: anyActive ? "#8b3b9e" : "#6b4d7a",
                      fontSize: 13, fontWeight: anyActive ? 600 : 500,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.icon}{item.label}
                    </span>
                    {isExp
                      ? <ChevronDown style={{ width: 14, height: 14, opacity: 0.5 }} />
                      : <ChevronRight style={{ width: 14, height: 14, opacity: 0.5 }} />
                    }
                  </button>
                  {isExp && item.children.map((child) => (
                    <Link key={child.href} href={child.href} style={{
                      display: "block",
                      padding: "7px 10px 7px 36px",
                      borderRadius: 8, fontSize: 12,
                      fontWeight: isActive(child.href) ? 600 : 400,
                      color: isActive(child.href) ? "#8b3b9e" : "#7c5f8a",
                      background: isActive(child.href) ? "rgba(139,59,158,0.08)" : "transparent",
                      textDecoration: "none",
                    }}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )
            }
            return (
              <Link key={item.href} href={item.href!} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 10px", borderRadius: 10,
                fontSize: 13,
                fontWeight: isActive(item.href!) ? 600 : 500,
                color: isActive(item.href!) ? "#8b3b9e" : "#6b4d7a",
                background: isActive(item.href!) ? "rgba(139,59,158,0.08)" : "transparent",
                textDecoration: "none",
              }}>
                {item.icon}{item.label}
              </Link>
            )
          })}
        </nav>

        {/* User profile at bottom */}
        <div style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(190,113,209,0.12)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#2d1a38", margin: 0 }}>
              {session?.user?.loginId ?? "User"}
            </p>
            <p style={{ fontSize: 10, color: "#9b6aab", margin: 0 }}>
              {session?.user?.role ?? ""}
            </p>
          </div>
        </div>

      </div>
>>>>>>> beed07c (add new files and updates)
    </aside>
  )
}

export default Sidebar
