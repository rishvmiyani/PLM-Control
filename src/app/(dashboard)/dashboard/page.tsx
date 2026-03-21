import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import EngineeringDashboard from "@/components/dashboard/EngineeringDashboard"
import ApproverDashboard from "@/components/dashboard/ApproverDashboard"
import OperationsDashboard from "@/components/dashboard/OperationsDashboard"
import AdminDashboard from "@/components/dashboard/AdminDashboard"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const role = session.user.role

  if (role === "ENGINEERING") return <EngineeringDashboard />
  if (role === "APPROVER") return <ApproverDashboard />
  if (role === "OPERATIONS") return <OperationsDashboard />
  return <AdminDashboard />
}
