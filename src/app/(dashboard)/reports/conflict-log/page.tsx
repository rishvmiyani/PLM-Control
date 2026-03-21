import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ConflictLogClient from "@/components/reports/ConflictLogClient"

export const dynamic = "force-dynamic"

export default async function ConflictLogPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    where: { conflictStatus: "CONFLICT" },
    include: {
      product: { select: { name: true } },
      user:    { select: { loginId: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const rows = ecos.map((e) => ({
    id:          e.id,
    title:       e.title,
    stage:       e.stage,
    riskLevel:   e.riskLevel,
    product:     e.product.name,
    user:        e.user.loginId,
    createdAt:   e.createdAt.toISOString(),
    conflictStatus: e.conflictStatus,
  }))

  return <ConflictLogClient rows={rows} />
}
