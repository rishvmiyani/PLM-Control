"use client"

import Link          from "next/link"
import { usePathname } from "next/navigation"
import {
  GitPullRequest, BarChart3, Settings,
  ChevronDown, ChevronRight, Layers,
} from "lucide-react"
import { useState }  from "react"
import { useSession } from "next-auth/react"

interface NavChild {
  label: string
  href:  string
}

interface NavItem {
  label:     string
  href?:     string
  icon:      React.ReactNode
  children?: NavChild[]
}

const NAV: NavItem[] = [
  {
    label: "Engineering Change Order",
    href:  "/eco",                          // ← single link, no children
    icon:  <GitPullRequest style={{ width: 15, height: 15 }} />,
  },
  {
    label: "Master Data",
    icon:  <Layers style={{ width: 15, height: 15 }} />,
    children: [
      { label: "Bills of Material", href: "/bom" },
      { label: "Products",          href: "/products" },
    ],
  },
  {
    label: "Reporting",
    href:  "/reports",
    icon:  <BarChart3 style={{ width: 15, height: 15 }} />,
  },
  {
    label: "Settings",
    icon:  <Settings style={{ width: 15, height: 15 }} />,
    children: [
      { label: "ECO's Stage", href: "/settings/stages" },
    ],
  },
]

const font = "'DM Sans', sans-serif"

interface Props { isOpen: boolean }

function Sidebar({ isOpen }: Props) {
  const pathname          = usePathname()
  const { data: session } = useSession()

  const [expanded, setExpanded] = useState<string[]>([
    "Master Data",
    "Settings",
  ])

  const toggle = (label: string) =>
    setExpanded((p) =>
      p.includes(label) ? p.filter((l) => l !== label) : [...p, label]
    )

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const initials = ((session?.user as any)?.loginId ?? session?.user?.name ?? "U")
    .slice(0, 2).toUpperCase()

  return (
    <aside style={{
      position:      "fixed",
      top:           0,
      left:          0,
      height:        "100%",
      width:         isOpen ? 210 : 0,
      overflow:      "hidden",
      zIndex:        40,
      transition:    "width 0.25s ease",
      background:    "#f5eefa",
      borderRight:   "1px solid rgba(190,113,209,0.15)",
      display:       "flex",
      flexDirection: "column",
      fontFamily:    font,
    }}>
      <div style={{ width: 210, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Logo */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          10,
          padding:      "18px 16px 16px",
          borderBottom: "1px solid rgba(190,113,209,0.12)",
          flexShrink:   0,
        }}>
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   10,
            background:     "linear-gradient(135deg,#8b3b9e,#be71d1)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
            boxShadow:      "0 2px 8px rgba(139,59,158,0.25)",
          }}>
            <Layers style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#2d1a38", margin: 0, lineHeight: 1.2 }}>
              CRISP
            </p>
            <p style={{ fontSize: 10, color: "#9b6aab", margin: 0 }}>PLM Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {NAV.map((item) => {

            /* Group with children */
            if (item.children) {
              const isExp     = expanded.includes(item.label)
              const anyActive = item.children.some((c) => isActive(c.href))

              return (
                <div key={item.label} style={{ marginBottom: 2 }}>
                  <button
                    onClick={() => toggle(item.label)}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      width:          "100%",
                      padding:        "9px 10px",
                      borderRadius:   10,
                      border:         "none",
                      background:     anyActive ? "rgba(139,59,158,0.08)" : "transparent",
                      color:          anyActive ? "#8b3b9e" : "#6b4d7a",
                      fontSize:       12,
                      fontWeight:     anyActive ? 700 : 500,
                      cursor:         "pointer",
                      fontFamily:     font,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.icon}{item.label}
                    </span>
                    {isExp
                      ? <ChevronDown  style={{ width: 13, height: 13, opacity: 0.5 }} />
                      : <ChevronRight style={{ width: 13, height: 13, opacity: 0.5 }} />
                    }
                  </button>

                  {isExp && (
                    <div style={{ marginTop: 2, marginBottom: 4 }}>
                      {item.children.map((child) => {
                        const active = isActive(child.href)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            style={{
                              display:        "flex",
                              alignItems:     "center",
                              gap:            7,
                              padding:        "7px 10px 7px 34px",
                              borderRadius:   8,
                              fontSize:       12,
                              fontWeight:     active ? 700 : 400,
                              color:          active ? "#8b3b9e" : "#7c5f8a",
                              background:     active ? "rgba(139,59,158,0.09)" : "transparent",
                              textDecoration: "none",
                              marginBottom:   1,
                            }}
                          >
                            <span style={{
                              width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                              background: active ? "#8b3b9e" : "rgba(190,113,209,0.30)",
                            }} />
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            /* Single link — only render if href exists */
            if (!item.href) return null

            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            8,
                  padding:        "9px 10px",
                  borderRadius:   10,
                  fontSize:       12,
                  fontWeight:     active ? 700 : 500,
                  color:          active ? "#8b3b9e" : "#6b4d7a",
                  background:     active ? "rgba(139,59,158,0.08)" : "transparent",
                  textDecoration: "none",
                  marginBottom:   2,
                }}
              >
                {item.icon}{item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div style={{
          padding:      "12px 14px",
          borderTop:    "1px solid rgba(190,113,209,0.12)",
          display:      "flex",
          alignItems:   "center",
          gap:          10,
          flexShrink:   0,
        }}>
          <div style={{
            width:          32, height: 32, borderRadius: "50%",
            background:     "linear-gradient(135deg,#8b3b9e,#be71d1)",
            display:        "flex", alignItems: "center", justifyContent: "center",
            fontSize:       11, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "#2d1a38", margin: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {(session?.user as any)?.loginId ?? session?.user?.name ?? "User"}
            </p>
            <p style={{ fontSize: 9, color: "#9b6aab", margin: 0 }}>
              {(session?.user as any)?.role ?? "Member"}
            </p>
          </div>
        </div>

      </div>
    </aside>
  )
}

export default Sidebar
