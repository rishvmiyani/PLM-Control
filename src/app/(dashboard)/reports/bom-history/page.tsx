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

export default async function BOMHistoryPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const boms = await prisma.bOM.findMany({
    orderBy: [{ productId: "asc" }, { version: "desc" }],
    include: {
      product: { select: { name: true } },
      _count: { select: { components: true, operations: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">BOM History</h1>
          <p className="text-zinc-500 text-sm">{boms.length} total BOM versions</p>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Product</TableHead>
              <TableHead>BOM Version</TableHead>
              <TableHead>Components</TableHead>
              <TableHead>Operations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boms.map((bom) => (
              <TableRow
                key={bom.id}
                className={String(bom.status) === "ARCHIVED" ? "opacity-50" : ""}
              >
                <TableCell className="font-medium">{bom.product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">v{bom.version}</Badge>
                </TableCell>
                <TableCell>{bom._count.components}</TableCell>
                <TableCell>{bom._count.operations}</TableCell>
                <TableCell>
                  <Badge variant={String(bom.status) === "ACTIVE" ? "default" : "secondary"}>
                    {String(bom.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400 text-sm">
                  {format(new Date(bom.createdAt), "dd MMM yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
