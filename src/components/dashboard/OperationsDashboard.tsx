import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ListTree } from "lucide-react"

export default async function OperationsDashboard() {
  const session = await auth()
  if (!session) return null

  const [products, boms] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      include: { _count: { select: { boms: true } } },
    }),
    prisma.bOM.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
        _count: { select: { components: true, operations: true } },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Welcome, {session.user.loginId}
        </h1>
        <p className="text-zinc-500 text-sm mt-0.5">Operations Dashboard — Read Only</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-4">
          <Package className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-zinc-400">Active Products</p>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-4">
          <ListTree className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-2xl font-bold">{boms.length}</p>
            <p className="text-xs text-zinc-400">Active BOMs</p>
          </div>
        </div>
      </div>

      {/* Active Products Grid */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h2 className="font-semibold text-zinc-800 mb-4">Active Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`}>
              <div className="border border-zinc-100 rounded-lg p-4 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-800">{p.name}</p>
                  <Badge variant="outline">v{p.version}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
                  <span>₹{p.salePrice.toLocaleString()}</span>
                  <span>{p._count.boms} BOM(s)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active BOMs */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h2 className="font-semibold text-zinc-800 mb-4">Active BOMs</h2>
        <div className="space-y-2">
          {boms.map((bom) => (
            <Link key={bom.id} href={`/bom/${bom.id}`}>
              <div className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{bom.product.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {bom._count.components} components · {bom._count.operations} operations
                  </p>
                </div>
                <Badge variant="outline">v{bom.version}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
