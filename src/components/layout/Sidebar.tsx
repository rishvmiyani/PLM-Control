"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, Package, ListTree,
  GitPullRequest, BarChart3, Settings,
  ChevronLeft, ChevronRight,
} from "lucide-react"
import { useState } from "react"

const ALL_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "ENGINEERING", "APPROVER", "OPERATIONS"] },
  { label: "Products", href: "/products", icon: Package, roles: ["ADMIN", "ENGINEERING", "OPERATIONS"] },
  { label: "BOM", href: "/bom", icon: ListTree, roles: ["ADMIN", "ENGINEERING", "OPERATIONS"] },
  { label: "ECO", href: "/eco", icon: GitPullRequest, roles: ["ADMIN", "ENGINEERING", "APPROVER"] },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "ENGINEERING", "APPROVER"] },
  { label: "Settings", href: "/settings/stages", icon: Settings, roles: ["ADMIN"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const role = session?.user?.role ?? ""
  const nav = ALL_NAV.filter((n) => n.roles.includes(role))

  return (
    <aside
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
            </p>
            <span className="text-xs text-zinc-400">{role}</span>
          </div>
        </div>
      )}

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
    </aside>
  )
}


