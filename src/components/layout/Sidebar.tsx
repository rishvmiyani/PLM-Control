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
import Image from "next/image"


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
        <Image
          src="/logo.png"
          alt="CRISP logo"
          width={72}
          height={32}
          style={{ objectFit: "contain" }}
        />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#2d1a38", lineHeight: 1.2 }}>
            CRISP
          </p>
          <p style={{ fontSize: 10, color: "#9b6aab" }}></p>
        </div>
</div>
      

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

      </div>
    </aside>
  )
}

export default Sidebar
