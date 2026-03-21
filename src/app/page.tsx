import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/dashboard/AdminDashboard"
import EngineeringDashboard from "@/components/dashboard/EngineeringDashboard"
import ApproverDashboard from "@/components/dashboard/ApproverDashboard"
import OperationsDashboard from "@/components/dashboard/OperationsDashboard"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role

  if (role === "ADMIN") return <AdminDashboard />
  if (role === "ENGINEERING") return <EngineeringDashboard />
  if (role === "APPROVER") return <ApproverDashboard />
  return <OperationsDashboard />
}
