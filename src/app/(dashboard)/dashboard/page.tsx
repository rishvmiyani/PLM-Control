import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  let session

  try {
    session = await auth()
  } catch (e) {
    console.error("Auth error:", e)
    redirect("/login")
  }

  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role

  console.log("Dashboard role:", role) // ← check terminal

  if (role === "ADMIN") {
    const { default: AdminDashboard } = await import(
      "@/components/dashboard/AdminDashboard"
    )
    return <AdminDashboard />
  }

  if (role === "ENGINEERING") {
    const { default: EngineeringDashboard } = await import(
      "@/components/dashboard/EngineeringDashboard"
    )
    return <EngineeringDashboard />
  }

  if (role === "APPROVER") {
    const { default: ApproverDashboard } = await import(
      "@/components/dashboard/ApproverDashboard"
    )
    return <ApproverDashboard />
  }

  const { default: OperationsDashboard } = await import(
    "@/components/dashboard/OperationsDashboard"
  )
  return <OperationsDashboard />
}
