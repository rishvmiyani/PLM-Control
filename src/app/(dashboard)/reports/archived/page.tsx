import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

export default async function ArchivedPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [archivedProducts, archivedBOMs] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ARCHIVED" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.bOM.findMany({
      where: { status: "ARCHIVED" },
      orderBy: { updatedAt: "desc" },
      include: { product: { select: { name: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Archived Items</h1>
          <p className="text-zinc-500 text-sm">
            {archivedProducts.length} products · {archivedBOMs.length} BOMs archived
          </p>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">
            Products ({archivedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="boms">BOMs ({archivedBOMs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Archived</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-400 py-8">
                      No archived products
                    </TableCell>
                  </TableRow>
                ) : (
                  archivedProducts.map((p) => (
                    <TableRow key={p.id} className="opacity-60">
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">v{p.version}</Badge>
                      </TableCell>
                      <TableCell>₹{p.salePrice.toLocaleString()}</TableCell>
                      <TableCell>₹{p.costPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {format(new Date(p.updatedAt), "dd MMM yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="boms" className="mt-4">
          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead>Product</TableHead>
                  <TableHead>BOM Version</TableHead>
                  <TableHead>Archived</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedBOMs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-zinc-400 py-8">
                      No archived BOMs
                    </TableCell>
                  </TableRow>
                ) : (
                  archivedBOMs.map((bom) => (
                    <TableRow key={bom.id} className="opacity-60">
                      <TableCell className="font-medium">{bom.product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">v{bom.version}</Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {format(new Date(bom.updatedAt), "dd MMM yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
