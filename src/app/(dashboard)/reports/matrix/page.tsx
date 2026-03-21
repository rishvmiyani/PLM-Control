import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

export default async function ECOMatrixPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      user: { select: { loginId: true } },
    },
  })

  const STAGE_COLORS: Record<string, string> = {
    "New": "bg-zinc-100 text-zinc-700",
    "Engineering Review": "bg-blue-100 text-blue-700",
    "Approval": "bg-yellow-100 text-yellow-700",
    "Done": "bg-green-100 text-green-700",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">ECO Matrix</h1>
          <p className="text-zinc-500 text-sm">{ecos.length} total ECOs</p>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Title</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Conflict</TableHead>
              <TableHead>By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ecos.map((eco) => (
              <TableRow key={eco.id}>
                <TableCell className="font-medium max-w-48 truncate">
                  {eco.title}
                </TableCell>
                <TableCell className="text-sm">
                  {eco.product.name}
                  <span className="text-zinc-400 ml-1">v{eco.product.version}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {String(eco.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      STAGE_COLORS[eco.stage] ?? "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {eco.stage}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      String(eco.riskLevel) === "CRITICAL" ||
                      String(eco.riskLevel) === "HIGH"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {String(eco.riskLevel)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {eco.riskScore}
                </TableCell>
                <TableCell>
                  {String(eco.conflictStatus) === "CONFLICT" ? (
                    <Badge variant="destructive" className="text-xs">
                      CONFLICT
                    </Badge>
                  ) : (
                    <span className="text-xs text-zinc-400">None</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {eco.user.loginId}
                </TableCell>
                <TableCell className="text-zinc-400 text-xs">
                  {format(new Date(eco.createdAt), "dd MMM yy")}
                </TableCell>
                <TableCell>
                  <Link href={`/eco/${eco.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
