"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ minHeight: "100vh", background: "#f8f3fc" }}>
      <Sidebar isOpen={sidebarOpen} />
      <TopBar
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />
      <main style={{
        marginLeft: sidebarOpen ? 200 : 0,
        marginTop: 56,
        padding: "28px 32px",
        transition: "margin-left 0.3s",
        minHeight: "calc(100vh - 56px)",
      }}>
        {children}
      </main>
    </div>
  )
}

export default DashboardShell
