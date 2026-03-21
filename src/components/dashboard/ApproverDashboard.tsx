import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { format, differenceInHours } from "date-fns"

export default async function ApproverDashboard() {
  const session = await auth()
  if (!session) return null

  const pendingECOs = await prisma.eCO.findMany({
    where: { stage: "Approval" },
    orderBy: { riskScore: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      user: { select: { loginId: true } },
    },
  })

  // SLA breach check
  const breachedECOs = pendingECOs.filter((e) => {
    const elapsed = differenceInHours(new Date(), new Date(e.enteredStageAt))
    return elapsed > 8 // Approval SLA = 8h
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Welcome, {session.user.loginId}
        </h1>
        <p className="text-zinc-500 text-sm mt-0.5">Approver Dashboard</p>
      </div>

      {/* SLA Breach Banner */}
      {breachedECOs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {breachedECOs.length} ECO(s) have breached SLA
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              These ECOs have exceeded the 8-hour approval window.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <Clock className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{pendingECOs.length}</p>
          <p className="text-xs text-zinc-400">Awaiting Approval</p>
        </div>
        <div className={`border rounded-xl p-4 ${breachedECOs.length > 0 ? "bg-red-50 border-red-200" : "bg-white border-zinc-200"}`}>
          <AlertTriangle className={`w-5 h-5 mb-2 ${breachedECOs.length > 0 ? "text-red-500" : "text-zinc-300"}`} />
          <p className="text-2xl font-bold">{breachedECOs.length}</p>
          <p className="text-xs text-zinc-400">SLA Breached</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">
            {await prisma.eCO.count({ where: { stage: "Done" } })}
          </p>
          <p className="text-xs text-zinc-400">Total Approved</p>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-800">Awaiting My Approval</h2>
        </div>
        {pendingECOs.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nothing pending approval 🎉</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Risk</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">SLA</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">By</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pendingECOs.map((eco) => {
                const elapsed = differenceInHours(new Date(), new Date(eco.enteredStageAt))
                const breached = elapsed > 8
                return (
                  <tr key={eco.id} className={`hover:bg-zinc-50 ${breached ? "bg-red-50/40" : ""}`}>
                    <td className="px-4 py-3 font-medium text-zinc-800 max-w-48 truncate">
                      {eco.title}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {eco.product.name} v{eco.product.version}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={["HIGH", "CRITICAL"].includes(String(eco.riskLevel)) ? "destructive" : "secondary"}>
                        {String(eco.riskLevel)} · {eco.riskScore}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${breached ? "text-red-600" : "text-green-600"}`}>
                        {breached ? `🔴 ${elapsed - 8}h overdue` : `🟢 ${8 - elapsed}h left`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{eco.user.loginId}</td>
                    <td className="px-4 py-3">
                      <Link href={`/eco/${eco.id}`}>
                        <Button size="sm" className="gap-1">
                          Review →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
