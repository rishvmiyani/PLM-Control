import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import BomTreeDiffWrapper from "@/components/diff/BomTreeDiffWrapper"

export default async function ECODiffPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const eco = await prisma.eCO.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, version: true } },
      bom: {
        include: {
          components: {
            include: {
              product: { select: { name: true, costPrice: true } },
            },
          },
          operations: true,
        },
      },
    },
  })

  if (!eco || eco.type !== "BOM" || !eco.bom) redirect(`/eco/${id}`)

  const proposed = eco.proposedChanges as {
    components?: Array<{
      productId: string
      quantity: number
      action: "ADD" | "REMOVE" | "MODIFY" | "UNCHANGED"
    }>
    operations?: Array<{
      name: string
      durationMins: number
      workCenter: string
      action: "ADD" | "REMOVE" | "MODIFY" | "UNCHANGED"
    }>
  }

  const currentComps = eco.bom.components
  const proposedComps = proposed.components ?? []

  const mergedComponents = currentComps.map((c) => {
    const prop = proposedComps.find((p) => p.productId === c.productId)
    return {
      ...c,
      quantity: prop?.quantity ?? c.quantity,
      action: prop?.action ?? ("UNCHANGED" as const),
    }
  })

  proposedComps
    .filter((p) => p.action === "ADD")
    .forEach((p) => {
      if (!currentComps.find((c) => c.productId === p.productId)) {
        mergedComponents.push({
          id: `new-${p.productId}`,
          bomId: eco.bom!.id,
          productId: p.productId,
          quantity: p.quantity,
          action: "ADD" as const,
          product: { name: p.productId, costPrice: 0 },
        })
      }
    })

  const mergedOperations = (eco.bom.operations ?? []).map((o) => {
    const prop = (proposed.operations ?? []).find((p) => p.name === o.name)
    return {
      ...o,
      action: prop?.action ?? ("UNCHANGED" as const),
    }
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/eco/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">BOM Diff View</h1>
          <p className="text-zinc-400 text-sm">
            {eco.product.name} v{eco.product.version} — {eco.title}
          </p>
        </div>
      </div>

      <BomTreeDiffWrapper
        productName={eco.product.name}
        productVersion={eco.product.version}
        components={mergedComponents}
        operations={mergedOperations}
      />
    </div>
  )
}
