import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { checkAllSLABreaches, createSLANotifications } from "@/lib/sla-engine"
import SessionProvider from "@/components/layout/SessionProvider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  // Run SLA check for ADMIN and APPROVER on every layout render
  if (["ADMIN", "APPROVER"].includes(session.user.role)) {
    try {
      const breaches = await checkAllSLABreaches()
      if (breaches.length > 0) {
        await createSLANotifications(breaches)
      }
    } catch (e) {
      console.warn("SLA check failed:", e)
    }
  }

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-zinc-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
