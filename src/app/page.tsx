import { auth }                from "@/lib/auth"
import { redirect }            from "next/navigation"
import ApproverDashboard       from "@/components/dashboard/ApproverDashboard"
import EngineeringDashboard    from "@/components/dashboard/EngineeringDashboard"
import AdminDashboard          from "@/components/dashboard/AdminDashboard"
import OperationsDashboard     from "@/components/dashboard/OperationsDashboard"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as any).role

  if (role === "APPROVER")    return <ApproverDashboard />
  if (role === "ADMIN")       return <AdminDashboard />
  if (role === "OPERATIONS")  return <OperationsDashboard />
  return <EngineeringDashboard />
}
