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
    <div className="font-['DM_Sans'] space-y-8 p-6 lg:p-12">
      {/* Header */}
      <div className="glass-header">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#8b3b9e] via-[#be71d1] to-[#e6c6ed] bg-clip-text text-transparent drop-shadow-2xl">
          Welcome, {session.user.loginId}
        </h1>
        <p className="text-[#8b3b9e]/80 text-xl mt-3 font-semibold tracking-wide">Approver Dashboard</p>
      </div>

      {/* SLA Breach Banner */}
      {breachedECOs.length > 0 && (
        <div className="glass-alert-danger p-8 rounded-4xl flex items-start gap-6 group hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
          <div className="glass-badge-danger w-14 h-14 flex items-center justify-center rounded-3xl shadow-2xl shrink-0 backdrop-blur-xl">
            <AlertTriangle className="w-8 h-8 text-[#8b3b9e]" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-[#8b3b9e] tracking-tight">
              {breachedECOs.length} ECO(s) have breached SLA
            </p>
            <p className="text-lg text-[#8b3b9e]/80 mt-2 font-semibold tracking-wide">
              These ECOs have exceeded the 8-hour approval window.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-stat-card p-10 text-center group hover:shadow-4xl hover:-translate-y-3 transition-all duration-500">
          <div className="glass-icon-circle w-20 h-20 mx-auto mb-6 flex items-center justify-center backdrop-blur-2xl shadow-2xl">
            <Clock className="w-10 h-10 text-[#be71d1]" />
          </div>
          <p className="text-5xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg">
            {pendingECOs.length}
          </p>
          <p className="text-xl text-[#8b3b9e]/70 font-semibold mt-4 tracking-wide">Awaiting Approval</p>
        </div>

        <div className={`glass-stat-card p-10 text-center group hover:shadow-4xl hover:-translate-y-3 transition-all duration-500 ${
          breachedECOs.length > 0 ? "ring-4 ring-[#8b3b9e]/30 bg-gradient-to-br from-[#8b3b9e]/10 to-[#be71d1]/10 border-[#8b3b9e]/40" : ""
        }`}>
          <div className={`glass-icon-circle w-20 h-20 mx-auto mb-6 flex items-center justify-center backdrop-blur-2xl shadow-2xl ${
            breachedECOs.length > 0 ? "bg-gradient-to-br from-[#8b3b9e]/20 to-[#be71d1]/20" : ""
          }`}>
            <AlertTriangle className={`w-10 h-10 ${breachedECOs.length > 0 ? "text-[#8b3b9e]" : "text-[#e6c6ed]/60"}`} />
          </div>
          <p className="text-5xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg">
            {breachedECOs.length}
          </p>
          <p className="text-xl text-[#8b3b9e]/70 font-semibold mt-4 tracking-wide">SLA Breached</p>
        </div>

        <div className="glass-stat-card p-10 text-center group hover:shadow-4xl hover:-translate-y-3 transition-all duration-500">
          <div className="glass-icon-circle w-20 h-20 mx-auto mb-6 flex items-center justify-center backdrop-blur-2xl shadow-2xl bg-gradient-to-br from-[#be71d1]/30 to-[#e6c6ed]/30">
            <CheckCircle className="w-10 h-10 text-[#be71d1]" />
          </div>
          <p className="text-5xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg">
            {await prisma.eCO.count({ where: { stage: "Done" } })}
          </p>
          <p className="text-xl text-[#8b3b9e]/70 font-semibold mt-4 tracking-wide">Total Approved</p>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="glass-card max-w-7xl">
        <div className="px-10 py-8 border-b border-white/40 backdrop-blur-xl">
          <h2 className="text-4xl font-black text-[#8b3b9e] tracking-tight drop-shadow-xl">
            Awaiting My Approval
          </h2>
        </div>
        
        {pendingECOs.length === 0 ? (
          <div className="glass-empty-state text-center py-24 px-12">
            <div className="glass-icon-circle w-32 h-32 mx-auto mb-8 flex items-center justify-center backdrop-blur-2xl shadow-3xl">
              <CheckCircle className="w-16 h-16 text-[#be71d1]/60" />
            </div>
            <p className="text-3xl font-bold text-[#8b3b9e]/60 tracking-wide">Nothing pending approval 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-lg">
              <thead className="glass-table-header">
                <tr>
                  <th className="text-left px-8 py-6 text-[#8b3b9e]/80 font-bold tracking-wide">Title</th>
                  <th className="text-left px-8 py-6 text-[#8b3b9e]/80 font-bold tracking-wide">Product</th>
                  <th className="text-left px-8 py-6 text-[#8b3b9e]/80 font-bold tracking-wide">Risk</th>
                  <th className="text-left px-8 py-6 text-[#8b3b9e]/80 font-bold tracking-wide">SLA</th>
                  <th className="text-left px-8 py-6 text-[#8b3b9e]/80 font-bold tracking-wide">By</th>
                  <th className="px-8 py-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {pendingECOs.map((eco) => {
                  const elapsed = differenceInHours(new Date(), new Date(eco.enteredStageAt))
                  const breached = elapsed > 8
                  return (
                    <tr 
                      key={eco.id} 
                      className={`glass-table-row group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${
                        breached ? "ring-2 ring-[#8b3b9e]/30 bg-gradient-to-r from-[#8b3b9e]/5 to-[#be71d1]/5" : ""
                      }`}
                    >
                      <td className="px-8 py-8 font-bold text-[#1f1f1f] max-w-md truncate group-hover:text-[#8b3b9e]">
                        {eco.title}
                      </td>
                      <td className="px-8 py-8 text-[#8b3b9e]/80 font-semibold">
                        {eco.product.name} v{eco.product.version}
                      </td>
                      <td className="px-8 py-8">
                        <Badge 
                          variant={["HIGH", "CRITICAL"].includes(String(eco.riskLevel)) ? "destructive" : "secondary"}
                          className="glass-badge-lg px-6 py-3 font-bold text-base shadow-xl backdrop-blur-xl"
                        >
                          {String(eco.riskLevel)} · {eco.riskScore}
                        </Badge>
                      </td>
                      <td className="px-8 py-8">
                        <span className={`glass-sla-badge px-6 py-3 rounded-2xl font-bold text-base shadow-xl transform hover:scale-105 transition-all duration-200 ${
                          breached 
                            ? "bg-gradient-to-r from-[#8b3b9e]/30 to-[#be71d1]/30 text-[#8b3b9e] border-[#8b3b9e]/40" 
                            : "bg-gradient-to-r from-[#be71d1]/40 to-[#e6c6ed]/40 text-[#8b3b9e]"
                        }`}>
                          {breached ? `🔴 ${elapsed - 8}h overdue` : `🟢 ${8 - elapsed}h left`}
                        </span>
                      </td>
                      <td className="px-8 py-8 text-[#8b3b9e]/80 font-semibold">{eco.user.loginId}</td>
                      <td className="px-8 py-8">
                        <Link href={`/eco/${eco.id}`}>
                          <Button 
                            size="lg" 
                            className="glass-button px-8 py-4 font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 gap-2 backdrop-blur-xl"
                          >
                            Review →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}