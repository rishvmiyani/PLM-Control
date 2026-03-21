import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

export default async function StagesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const stages = await prisma.eCOStage.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { approvalRules: true } } },
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">ECO Stages</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Workflow stages for ECO lifecycle
        </p>
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Order</TableHead>
              <TableHead>Stage Name</TableHead>
              <TableHead>Requires Approval</TableHead>
              <TableHead>SLA (hours)</TableHead>
              <TableHead>Approval Rules</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.map((stage) => (
              <TableRow key={stage.id}>
                <TableCell className="font-medium">{stage.order}</TableCell>
                <TableCell>{stage.name}</TableCell>
                <TableCell>
                  <Badge variant={stage.requireApproval ? "default" : "secondary"}>
                    {stage.requireApproval ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>{stage.slaHours}h</TableCell>
                <TableCell>{stage._count.approvalRules}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
