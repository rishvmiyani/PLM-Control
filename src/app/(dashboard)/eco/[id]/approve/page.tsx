import { auth }        from "@/lib/auth"
import { redirect }    from "next/navigation"
import { prisma }      from "@/lib/prisma"
import ECOApprovePage  from "@/components/eco/ECOApprovePage"

export default async function ApprovePageServer({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const eco = await prisma.eCO.findUnique({
    where:   { id },
    include: {
      product: true,
      bom: {
        include: {
          components: { include: { product: { select: { name: true } } } },
          operations: true,
        },
      },
      user: { select: { loginId: true } },
    },
  })

  if (!eco) redirect("/eco")

  const serialized = {
    id:             eco.id,
    ecoNumber:      eco.ecoNumber ?? eco.id.slice(0, 8).toUpperCase(),
    title:          eco.title,
    type:           eco.type,
    stage:          eco.stage,
    riskLevel:      eco.riskLevel,
    riskScore:      eco.riskScore,
    conflictStatus: eco.conflictStatus,
    versionUpdate:  eco.versionUpdate,
    effectiveDate:  eco.effectiveDate.toISOString(),
    createdAt:      eco.createdAt.toISOString(),
    proposedChanges: eco.proposedChanges as Record<string, any>,
    product: {
      id:        eco.product.id,
      name:      eco.product.name,
      version:   eco.product.version,
      salePrice: eco.product.salePrice,
      costPrice: eco.product.costPrice,
    },
    bom: eco.bom ? {
      id:         eco.bom.id,
      version:    eco.bom.version,
      components: eco.bom.components.map((c) => ({
        id:          c.id,
        productName: c.product.name,
        quantity:    c.quantity,
      })),
      operations: eco.bom.operations.map((o) => ({
        id:           o.id,
        name:         o.name,
        durationMins: o.durationMins,
        workCenter:   o.workCenter,
      })),
    } : null,
    user: { loginId: eco.user.loginId },
    userRole: (session.user as any).role,
    userLoginId: (session.user as any).loginId,
  }

  return <ECOApprovePage eco={serialized} />
}
