import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import BomTreeDiffWrapper from "@/components/diff/BomTreeDiffWrapper"

export default async function BOMTreePage({
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
      product: { select: { name: true, version: true } },
      components: {
        include: {
          product: { select: { name: true, costPrice: true } },
        },
      },
      operations: true,
    },
  })

  if (!bom) redirect("/bom")

  const components = bom.components.map((c) => ({
    ...c,
    action: "UNCHANGED" as const,
  }))

  const operations = bom.operations.map((o) => ({
    ...o,
    action: "UNCHANGED" as const,
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/bom/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            BOM Tree — {bom.product.name}
          </h1>
          <p className="text-zinc-400 text-sm">
            v{bom.version} · {bom.components.length} components ·{" "}
            {bom.operations.length} operations
          </p>
        </div>
      </div>

      <BomTreeDiffWrapper
        productName={bom.product.name}
        productVersion={bom.product.version}
        components={components}
        operations={operations}
      />
    </div>
  )
}
