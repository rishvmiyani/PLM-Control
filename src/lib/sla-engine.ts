import { prisma } from "@/lib/prisma"
import { differenceInMinutes } from "date-fns"

const SLA_MINUTES: Record<string, number> = {
  "New": 24 * 60,
  "Engineering Review": 12 * 60,
  "Approval": 8 * 60,
}

export async function checkAllSLABreaches() {
  const openECOs = await prisma.eCO.findMany({
    where: {
      stage: { notIn: ["Done", "Rejected"] },
    },
    select: {
      id: true,
      stage: true,
      enteredStageAt: true,
      title: true,
    },
  })

  const breached = openECOs.filter((eco) => {
    const slaMins = SLA_MINUTES[eco.stage]
    if (!slaMins) return false
    const elapsed = differenceInMinutes(new Date(), new Date(eco.enteredStageAt))
    return elapsed > slaMins
  })

  return breached
}

export async function createSLANotifications(
  breachedECOs: Array<{ id: string; stage: string; title: string }>
) {
  // Find all ADMIN + APPROVER users
  const targets = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "APPROVER"] } },
    select: { id: true },
  })

  for (const eco of breachedECOs) {
    for (const user of targets) {
      // Avoid duplicate notifications
      const existing = await prisma.notification.findFirst({
        where: {
          ecoId: eco.id,
          userId: user.id,
          type: "SLA_BREACH",
          isRead: false,
        },
      })

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            ecoId: eco.id,
            type: "SLA_BREACH",
            message: `ECO "${eco.title}" has exceeded SLA in "${eco.stage}" stage`,
            isRead: false,
          },
        })
      }
    }
  }
}
