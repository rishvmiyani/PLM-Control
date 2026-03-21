import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BOMTree } from "@/components/bom/BOMTree"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

export default async function BOMDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const bom = await prisma.bOM.findUnique({
    where: { id },
    include: {
      product: true,
      components: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              version: true,
              salePrice: true,
              costPrice: true,
            },
          },
        },
      },
      operations: true,
    },
  })

  if (!bom) notFound()

  const allVersions = await prisma.bOM.findMany({
    where: { productId: bom.productId },
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
  const isActive = String(bom.status) === "ACTIVE"

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/bom">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-zinc-900">
                {bom.product.name}
              </h1>
              <Badge variant="outline">BOM v{bom.version}</Badge>
              <Badge variant={isActive ? "default" : "secondary"}>
                {String(bom.status)}
              </Badge>
            </div>
            <p className="text-zinc-400 text-xs mt-1">
              Product v{bom.product.version} · BOM ID: {bom.id}
            </p>
          </div>
        </div>
        {canCreateECO && isActive && (
          <Link href={`/eco/new?bomId=${bom.id}&productId=${bom.productId}&type=BOM`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create ECO
            </Button>
          </Link>
        )}
      </div>

      {/* BOM Tree */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-800">Structure</h2>
          <Link href={`/bom/${bom.id}/tree`}>
            <Button variant="ghost" size="sm">View Tree</Button>
          </Link>
        </div>
        <BOMTree
          components={bom.components.map((c) => ({
            ...c,
            product: {
              ...c.product,
              salePrice: c.product.salePrice ?? 0,
              costPrice: c.product.costPrice ?? 0,
            },
          }))}
          operations={bom.operations}
        />
      </div>

      <Separator />

      {/* Version History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-800">Version History</h2>
          <Link href={`/bom/${bom.id}/timeline`}>
            <Button variant="ghost" size="sm">View Timeline</Button>
          </Link>
        </div>
        <div className="space-y-2">
          {allVersions.map((v) => (
            <Link
              key={v.id}
              href={`/bom/${v.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <span className="text-sm font-medium">BOM v{v.version}</span>
              <Badge variant={String(v.status) === "ACTIVE" ? "default" : "secondary"}>
                {String(v.status)}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
