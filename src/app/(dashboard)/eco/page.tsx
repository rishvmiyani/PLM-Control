import { auth }    from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma }   from "@/lib/prisma"
import ECOPageClient from "@/components/eco/ECOPageClient"
import { Plus }     from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ECOPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      user:    { select: { loginId: true } },
    },
  })

  const serialized = ecos.map((e) => ({
    id:             e.id,
    ecoNumber:      e.ecoNumber ?? "",
    title:          e.title,
    type:           e.type,
    stage:          e.stage,
    riskLevel:      e.riskLevel,
    riskScore:      e.riskScore ?? 0,
    conflictStatus: e.conflictStatus,
    createdAt:      e.createdAt.toISOString(),
    enteredStageAt: e.enteredStageAt.toISOString(),
    product:        { name: e.product.name, version: e.product.version },
    user:           { loginId: e.user.loginId },
  }))

  return (
    <ECOPageClient
      ecos={serialized}
      userRole={(session.user as any).role}
      userLoginId={(session.user as any).loginId}
    />
  )
}
