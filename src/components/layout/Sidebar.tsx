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
      className={`${
        collapsed ? "w-16" : "w-56"
      } transition-all duration-200 bg-white border-r border-zinc-200 flex flex-col h-screen sticky top-0 shrink-0`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-zinc-100">
        <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">P</span>
        </div>
        {!collapsed && (
          <span className="font-bold text-zinc-900 text-sm">PLM Intelligence</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
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
    </aside>
  )
}


