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

export default async function ProductHistoryPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const products = await prisma.product.findMany({
    orderBy: [{ name: "asc" }, { version: "desc" }],
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
          <h1 className="text-2xl font-bold text-zinc-900">Product History</h1>
          <p className="text-zinc-500 text-sm">{products.length} total versions</p>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p.id}
                className={String(p.status) === "ARCHIVED" ? "opacity-50" : ""}
              >
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">v{p.version}</Badge>
                </TableCell>
                <TableCell>₹{p.salePrice.toLocaleString()}</TableCell>
                <TableCell>₹{p.costPrice.toLocaleString()}</TableCell>
                <TableCell className="text-green-600 font-medium">
                  {p.salePrice > 0
                    ? (((p.salePrice - p.costPrice) / p.salePrice) * 100).toFixed(1)
                    : "0.0"}%
                </TableCell>
                <TableCell>
                  <Badge variant={String(p.status) === "ACTIVE" ? "default" : "secondary"}>
                    {String(p.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400 text-sm">
                  {format(new Date(p.createdAt), "dd MMM yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
