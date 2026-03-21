import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardShell from "@/components/layout/DashboardShell"
import SessionProvider from "@/components/layout/SessionProvider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <SessionProvider session={session}>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  )
}
