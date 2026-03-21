import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, GitPullRequest, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

const STAGE_COLORS: Record<string, string> = {
  "New": "bg-[#e6c6ed]/60 backdrop-blur-sm text-[#8b3b9e]",
  "Engineering Review": "bg-[#be71d1]/50 backdrop-blur-sm text-[#8b3b9e]",
  "Approval": "bg-[#8b3b9e]/30 backdrop-blur-sm text-[#8b3b9e]",
  "Done": "bg-[#be71d1]/70 backdrop-blur-sm text-[#8b3b9e]",
  "Rejected": "bg-[#e6c6ed]/50 backdrop-blur-sm text-[#8b3b9e]",
}

export default async function EngineeringDashboard() {
  const session = await auth()
  if (!session) return null

  const myECOs = await prisma.eCO.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      product: { select: { name: true, version: true } },
    },
  })

  const openCount = myECOs.filter((e) => e.stage !== "Done" && e.stage !== "Rejected").length
  const conflictCount = myECOs.filter((e) => e.conflictStatus === "CONFLICT").length
  const doneCount = myECOs.filter((e) => e.stage === "Done").length

  return (
    <div className="font-['DM_Sans'] space-y-8 p-6 lg:p-12">
      {/* Header */}
      <div className="glass-header flex items-center justify-between">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#8b3b9e] via-[#be71d1] to-[#e6c6ed] bg-clip-text text-transparent drop-shadow-2xl">
            Welcome, {session.user.loginId}
          </h1>
          <p className="text-[#8b3b9e]/80 text-xl mt-3 font-semibold tracking-wide">Engineering Dashboard</p>
        </div>
        <Link href="/eco/new">
          <Button className="glass-button px-8 py-6 text-lg font-bold shadow-2xl hover:shadow-3xl hover:-translate-y-1 gap-3 backdrop-blur-xl border-2">
            <Plus className="w-5 h-5" /> New ECO
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-stat-card p-10 text-center group hover:shadow-4xl hover:-translate-y-3 transition-all duration-500">
          <div className="glass-icon-circle w-24 h-24 mx-auto mb-8 flex items-center justify-center backdrop-blur-2xl shadow-2xl bg-gradient-to-br from-[#8b3b9e]/20 to-[#be71d1]/20">
            <GitPullRequest className="w-12 h-12 text-[#8b3b9e]" />
          </div>
          <p className="text-5xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg">
            {openCount}
          </p>
          <p className="text-xl text-[#8b3b9e]/70 font-semibold mt-4 tracking-wide">Open ECOs</p>
        </div>

        <div className={`glass-stat-card p-10 text-center group hover:shadow-4xl hover:-translate-y-3 transition-all duration-500 ring-4 ring-[#8b3b9e]/20 bg-gradient-to-br from-[#8b3b9e]/10 to-[#be71d1]/10 border-[#8b3b9e]/40 shadow-3xl`}>
          <div className="glass-icon-circle w-24 h-24 mx-auto mb-8 flex items-center justify-center backdrop-blur-2xl shadow-2xl bg-gradient-to-br from-[#8b3b9e]/30 to-[#be71d1]/30">
            <AlertTriangle className="w-12 h-12 text-[#8b3b9e]" />
          </div>
          <p className="text-5xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg">
            {conflictCount}
          </p>
          <p className="text-xl text-[#8b3b9e]/70 font-semibold mt-4 tracking-wide">Conflicts</p>
        </div>

        <div className="glass-stat-card p-10 text-center group hover:shadow-4xl hover:-translate-y-3 transition-all duration-500">
          <div className="glass-icon-circle w-24 h-24 mx-auto mb-8 flex items-center justify-center backdrop-blur-2xl shadow-2xl bg-gradient-to-br from-[#be71d1]/30 to-[#e6c6ed]/30">
            <Clock className="w-12 h-12 text-[#be71d1]" />
          </div>
          <p className="text-5xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg">
            {doneCount}
          </p>
          <p className="text-xl text-[#8b3b9e]/70 font-semibold mt-4 tracking-wide">Completed</p>
        </div>
      </div>

      {/* My ECOs Mini Kanban */}
      <div className="glass-card max-w-4xl">
        <div className="px-10 py-8 border-b border-white/40 backdrop-blur-xl">
          <h2 className="text-4xl font-black text-[#8b3b9e] tracking-tight drop-shadow-xl">
            My ECOs
          </h2>
        </div>
        
        {myECOs.length === 0 ? (
          <div className="glass-empty-state text-center py-20 px-12">
            <p className="text-3xl font-bold text-[#8b3b9e]/60 tracking-wide mb-6">No ECOs yet</p>
            <Link href="/eco/new">
              <Button 
                variant="outline" 
                size="lg" 
                className="glass-button-outline px-12 py-6 text-lg font-bold tracking-wide shadow-xl border-2 hover:shadow-2xl"
              >
                Create your first ECO
              </Button>
            </Link>
          </div>
        ) : (
          <div className="p-10 space-y-4">
            {myECOs.map((eco) => (
              <Link key={eco.id} href={`/eco/${eco.id}`}>
                <div className="glass-eco-card p-8 rounded-3xl hover:shadow-4xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer border border-white/60 hover:border-[#8b3b9e]/40">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xl font-bold text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg line-clamp-1">
                        {eco.title}
                      </p>
                      <p className="text-lg text-[#8b3b9e]/80 mt-2 font-semibold tracking-wide">
                        {eco.product.name} v{eco.product.version} · {format(new Date(eco.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-6">
                      {eco.conflictStatus === "CONFLICT" && (
                        <Badge 
                          variant="destructive" 
                          className="glass-conflict-badge px-6 py-3 font-bold text-base shadow-xl backdrop-blur-xl border-2"
                        >
                          Conflict
                        </Badge>
                      )}
                      <span className={`glass-stage-badge px-6 py-3 rounded-2xl font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200 ${STAGE_COLORS[eco.stage] ?? "bg-[#e6c6ed]/60 backdrop-blur-sm text-[#8b3b9e]"}`}>
                        {eco.stage}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}