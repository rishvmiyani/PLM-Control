import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { VersionTimeline } from "@/components/timeline/VersionTimeline"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      boms: { orderBy: { version: "desc" } },
      ecos: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { loginId: true } } },
      },
    },
  })

  if (!product) notFound()

  const allVersions = await prisma.product.findMany({
    where: { name: product.name },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const canCreateECO = ["ADMIN", "ENGINEERING"].includes(session.user.role)
  const isActive = product.status === "ACTIVE"

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-zinc-900">
                {product.name}
              </h1>
              <Badge variant="outline">v{product.version}</Badge>
              <Badge variant={isActive ? "default" : "secondary"}>
                {product.status}
              </Badge>
            </div>
            <p className="text-zinc-400 text-xs mt-1">ID: {product.id}</p>
          </div>
        </div>
        {canCreateECO && isActive && (
          <Link href={`/eco/new?productId=${product.id}&type=PRODUCT`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create ECO
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-sm text-zinc-500">Sale Price</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">
            ₹{product.salePrice.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-sm text-zinc-500">Cost Price</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">
            ₹{product.costPrice.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-sm text-zinc-500">Margin</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {product.salePrice > 0
              ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)
              : "0.0"}%
          </p>
        </div>
      </div>

      {/* BOMs */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-800">Bill of Materials</h2>
          {canCreateECO && isActive && (
            <Link href={`/bom/new?productId=${product.id}`}>
              <Button variant="outline" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                New BOM
              </Button>
            </Link>
          )}
        </div>
        {product.boms.length === 0 ? (
          <p className="text-sm text-zinc-400">No BOMs created yet.</p>
        ) : (
          <div className="space-y-2">
            {product.boms.map((bom) => (
              <Link
                key={bom.id}
                href={`/bom/${bom.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors"
              >
                <span className="text-sm font-medium">BOM v{bom.version}</span>
                <Badge variant={bom.status === "ACTIVE" ? "default" : "secondary"}>
                  {bom.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Version Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-800">Version History</h2>
          <Link href={`/products/${product.id}/timeline`}>
            <Button variant="ghost" size="sm">View Full Timeline</Button>
          </Link>
        </div>
        <VersionTimeline
          items={allVersions.map((v) => ({
            ...v,
            status: String(v.status),
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
          }))}
          type="product"
        />
      </div>
    </div>
  )
}
