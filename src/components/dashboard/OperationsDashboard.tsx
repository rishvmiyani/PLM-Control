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
    <div className="font-['DM_Sans'] space-y-8 p-6 lg:p-12">
      {/* Header */}
      <div className="glass-header">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#8b3b9e] via-[#be71d1] to-[#e6c6ed] bg-clip-text text-transparent drop-shadow-2xl">
            Welcome, {session.user.loginId}
          </h1>
          <p className="text-[#8b3b9e]/80 text-xl mt-3 font-semibold tracking-wide">Operations Dashboard — Read Only</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-stat-card p-12 flex items-center gap-8 group hover:shadow-4xl hover:-translate-y-3 transition-all duration-500">
          <div className="glass-icon-circle w-28 h-28 flex items-center justify-center backdrop-blur-2xl shadow-3xl bg-gradient-to-br from-[#8b3b9e]/20 to-[#be71d1]/20">
            <Package className="w-14 h-14 text-[#8b3b9e] drop-shadow-lg" />
          </div>
          <div className="text-left">
            <p className="text-6xl lg:text-7xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-2xl">
              {products.length}
            </p>
            <p className="text-2xl text-[#8b3b9e]/70 font-semibold mt-4 tracking-wide">Active Products</p>
          </div>
        </div>

        <div className="glass-stat-card p-12 flex items-center gap-8 group hover:shadow-4xl hover:-translate-y-3 transition-all duration-500">
          <div className="glass-icon-circle w-28 h-28 flex items-center justify-center backdrop-blur-2xl shadow-3xl bg-gradient-to-br from-[#be71d1]/30 to-[#e6c6ed]/30">
            <ListTree className="w-14 h-14 text-[#be71d1] drop-shadow-lg" />
          </div>
          <div className="text-left">
            <p className="text-6xl lg:text-7xl font-black text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-2xl">
              {boms.length}
            </p>
            <p className="text-2xl text-[#8b3b9e]/70 font-semibold mt-4 tracking-wide">Active BOMs</p>
          </div>
        </div>
      </div>

      {/* Active Products Grid */}
      <div className="glass-card max-w-6xl">
        <div className="px-12 py-10 border-b border-white/40 backdrop-blur-xl">
          <h2 className="text-4xl font-black text-[#8b3b9e] tracking-tight drop-shadow-xl">
            Active Products
          </h2>
        </div>
        <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`}>
              <div className="glass-product-card p-10 rounded-3xl hover:shadow-4xl hover:-translate-y-3 transition-all duration-500 group cursor-pointer border border-white/60 hover:border-[#8b3b9e]/40">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-2xl font-bold text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg line-clamp-2">
                    {p.name}
                  </p>
                  <Badge 
                    variant="outline" 
                    className="glass-badge px-6 py-3 font-bold text-lg shadow-xl backdrop-blur-xl border-[#8b3b9e]/40 text-[#8b3b9e]"
                  >
                    v{p.version}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xl text-[#8b3b9e]/80 font-semibold tracking-wide">
                  <span>₹{p.salePrice.toLocaleString()}</span>
                  <span>{p._count.boms} BOM(s)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active BOMs */}
      <div className="glass-card max-w-4xl">
        <div className="px-12 py-10 border-b border-white/40 backdrop-blur-xl">
          <h2 className="text-4xl font-black text-[#8b3b9e] tracking-tight drop-shadow-xl">
            Active BOMs
          </h2>
        </div>
        <div className="p-12 space-y-4">
          {boms.map((bom) => (
            <Link key={bom.id} href={`/bom/${bom.id}`}>
              <div className="glass-bom-card flex items-center justify-between p-10 rounded-3xl hover:shadow-4xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer border border-white/60 hover:border-[#8b3b9e]/40">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[#1f1f1f] group-hover:text-[#8b3b9e] transition-colors drop-shadow-lg line-clamp-1">
                    {bom.product.name}
                  </p>
                  <p className="text-xl text-[#8b3b9e]/80 mt-3 font-semibold tracking-wide">
                    {bom._count.components} components · {bom._count.operations} operations
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className="glass-badge px-6 py-3 font-bold text-xl shadow-xl backdrop-blur-xl border-[#8b3b9e]/40 text-[#8b3b9e] ml-6"
                >
                  v{bom.version}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}