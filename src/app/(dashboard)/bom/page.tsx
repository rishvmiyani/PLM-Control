import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function BOMPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const boms = await prisma.bOM.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      _count: { select: { components: true, operations: true } },
    },
  })

  const canCreate = ["ADMIN", "ENGINEERING"].includes(session.user.role)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Bill of Materials</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {boms.length} BOM{boms.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {canCreate && (
          <Link href="/bom/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New BOM
            </Button>
          </Link>
        )}
      </div>

      {boms.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed rounded-xl">
          No BOMs created yet
        </div>
      ) : (
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
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {boms.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell className="font-medium">
                    {bom.product.name}
                    <span className="text-zinc-400 text-xs ml-1">
                      (v{bom.product.version})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">v{bom.version}</Badge>
                  </TableCell>
                  <TableCell>{bom._count.components}</TableCell>
                  <TableCell>{bom._count.operations}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        String(bom.status) === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {String(bom.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {formatDistanceToNow(new Date(bom.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/bom/${bom.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
