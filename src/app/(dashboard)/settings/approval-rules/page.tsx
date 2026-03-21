import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

export default async function ApprovalRulesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const rules = await prisma.approvalRule.findMany({
    include: {
      stage: { select: { name: true, order: true } },
      user: { select: { loginId: true, role: true } },
    },
    orderBy: { stage: { order: "asc" } },
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Approval Rules</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Who approves ECOs at each stage
        </p>
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Stage</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                  No approval rules configured
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.stage.name}</TableCell>
                  <TableCell>{rule.user.loginId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{String(rule.user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        String(rule.category) === "REQUIRED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {String(rule.category)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
