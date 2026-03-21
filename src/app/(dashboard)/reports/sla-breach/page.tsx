import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { differenceInHours } from "date-fns"
import SLABreachClient from "@/components/reports/SLABreachClient"

export const dynamic = "force-dynamic"
const SLA_HOURS = 5

export default async function SLABreachPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ecos = await prisma.eCO.findMany({
    where: { stage: { notIn: ["Done", "Rejected"] } },
    include: {
      product: { select: { name: true } },
      user:    { select: { loginId: true } },
    },
    orderBy: { enteredStageAt: "asc" },
  })

  const rows = ecos.map((e) => {
    const hoursElapsed = differenceInHours(new Date(), e.enteredStageAt)
    return {
      id:            e.id,
      title:         e.title,
      stage:         e.stage,
      riskLevel:     e.riskLevel,
      product:       e.product.name,
      user:          e.user.loginId,
      hoursElapsed,
      isBreached:    hoursElapsed >= SLA_HOURS,
      enteredStageAt: e.enteredStageAt.toISOString(),
    }
  })

  return <SLABreachClient rows={rows} slaHours={SLA_HOURS} />
}
