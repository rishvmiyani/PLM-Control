import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import VersionTimelineWrapper from "@/components/timeline/VersionTimelineWrapper"

export default async function ProductTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) redirect("/products")

  const allVersions = await prisma.product.findMany({
    where: { name: product.name },
    orderBy: { version: "asc" },
    select: {
      id: true,
      version: true,
      status: true,
      salePrice: true,
      costPrice: true,
      createdAt: true,
    },
  })

  const isAdmin = session.user.role === "ADMIN"

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/products/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Version Timeline — {product.name}
          </h1>
          <p className="text-zinc-400 text-sm">
            {allVersions.length} versions · Click a node to inspect
          </p>
        </div>
      </div>

      <VersionTimelineWrapper
        versions={allVersions}
        isAdmin={isAdmin}
        activeId={id}
      />
    </div>
  )
}
