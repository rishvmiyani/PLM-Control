import { prisma } from "@/lib/prisma"

export async function writeAuditLog(
  ecoId: string,
  action: string,
  affectedRecord: string,
  oldValue: string | null | undefined,
  newValue: string | null | undefined,
  userId: string
) {
  await prisma.auditLog.create({
    data: {
      ecoId,
      action,
      affectedRecord,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      userId,
    },
  })
}
