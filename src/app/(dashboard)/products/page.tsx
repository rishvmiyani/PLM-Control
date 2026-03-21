import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { Plus } from "lucide-react"

export default async function ProductsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  })

  const active = products.filter((p) => String(p.status) === "ACTIVE")
const archived = products.filter((p) => String(p.status) === "ARCHIVED")
  const canCreate = ["ADMIN", "ENGINEERING"].includes(session.user.role)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {active.length} active product{active.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <Link href="/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archived.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <ProductTable products={active} />
        </TabsContent>
        <TabsContent value="archived" className="mt-4">
          <ProductTable products={archived} dimmed />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProductTable({
  products,
  dimmed = false,
}: {
  products: {
    id: string
    name: string
    version: number
    status: string
    salePrice: number
    costPrice: number
    createdAt: Date
  }[]
  dimmed?: boolean
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 border border-dashed rounded-xl">
        No products found
      </div>
    )
  }

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50">
            <TableHead>Name</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Sale Price</TableHead>
            <TableHead>Cost Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} className={dimmed ? "opacity-60" : ""}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>
                <Badge variant="outline">v{p.version}</Badge>
              </TableCell>
              <TableCell>₹{p.salePrice.toLocaleString()}</TableCell>
              <TableCell>₹{p.costPrice.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>
                  {p.status}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-400 text-sm">
                {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Link href={`/products/${p.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
