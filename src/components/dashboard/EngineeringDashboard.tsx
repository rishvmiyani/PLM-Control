import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, GitPullRequest, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

const STAGE_COLORS: Record<string, string> = {
  "New": "bg-zinc-100 text-zinc-700",
  "Engineering Review": "bg-blue-100 text-blue-700",
  "Approval": "bg-yellow-100 text-yellow-700",
  "Done": "bg-green-100 text-green-700",
  "Rejected": "bg-red-100 text-red-700",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Welcome, {session.user.loginId}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Engineering Dashboard</p>
        </div>
        <Link href="/eco/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New ECO
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitPullRequest className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{openCount}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Open ECOs</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{conflictCount}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Conflicts</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{doneCount}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Completed</p>
        </div>
      </div>

      {/* My ECOs Mini Kanban */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h2 className="font-semibold text-zinc-800 mb-4">My ECOs</h2>
        {myECOs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400 text-sm mb-3">No ECOs yet</p>
            <Link href="/eco/new">
              <Button variant="outline" size="sm">Create your first ECO</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myECOs.map((eco) => (
              <Link key={eco.id} href={`/eco/${eco.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{eco.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {eco.product.name} v{eco.product.version} ·{" "}
                      {format(new Date(eco.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {eco.conflictStatus === "CONFLICT" && (
                      <Badge variant="destructive" className="text-xs">Conflict</Badge>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STAGE_COLORS[eco.stage] ?? ""}`}>
                      {eco.stage}
                    </span>
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
