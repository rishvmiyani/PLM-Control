import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { VersionTimeline } from "@/components/timeline/VersionTimeline"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function BOMTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const bom = await prisma.bOM.findUnique({
    where: { id },
    include: { product: { select: { name: true } } },
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

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/bom/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">BOM Timeline</h1>
          <p className="text-zinc-500 text-sm">{bom.product.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <VersionTimeline
          items={allVersions.map((v) => ({
            ...v,
            status: String(v.status),
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
          }))}
          type="bom"
        />
      </div>
    </div>
  )
}
