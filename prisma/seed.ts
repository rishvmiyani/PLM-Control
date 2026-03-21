import * as dotenv from "dotenv"
dotenv.config()

import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const users = await Promise.all([
    prisma.user.upsert({
      where: { loginId: "admin1" },
      update: {},
      create: {
        loginId: "admin1",
        email: "admin@plm.com",
        password: await bcrypt.hash("Admin@123", 12),
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { loginId: "eng001" },
      update: {},
      create: {
        loginId: "eng001",
        email: "eng@plm.com",
        password: await bcrypt.hash("Eng@12345", 12),
        role: "ENGINEERING",
      },
    }),
    prisma.user.upsert({
      where: { loginId: "apvr01" },
      update: {},
      create: {
        loginId: "apvr01",
        email: "approver@plm.com",
        password: await bcrypt.hash("Appr@123", 12),
        role: "APPROVER",
      },
    }),
    prisma.user.upsert({
      where: { loginId: "ops001" },
      update: {},
      create: {
        loginId: "ops001",
        email: "ops@plm.com",
        password: await bcrypt.hash("Ops@1234", 12),
        role: "OPERATIONS",
      },
    }),
  ])

  const stages = await Promise.all([
    prisma.eCOStage.upsert({
      where: { name: "New" },
      update: {},
      create: { name: "New", order: 1, requireApproval: false, slaHours: 24 },
    }),
    prisma.eCOStage.upsert({
      where: { name: "Engineering Review" },
      update: {},
      create: { name: "Engineering Review", order: 2, requireApproval: false, slaHours: 12 },
    }),
    prisma.eCOStage.upsert({
      where: { name: "Approval" },
      update: {},
      create: { name: "Approval", order: 3, requireApproval: true, slaHours: 8 },
    }),
    prisma.eCOStage.upsert({
      where: { name: "Done" },
      update: {},
      create: { name: "Done", order: 4, requireApproval: false, slaHours: 0 },
    }),
  ])

  await prisma.approvalRule.upsert({
    where: { id: "seed-approval-rule-1" },
    update: {},
    create: {
      id: "seed-approval-rule-1",
      stageId: stages[2].id,
      userId: users[2].id,
      category: "REQUIRED",
    },
  })

  console.log("✅ Seed complete")
}

main().catch(console.error).finally(() => prisma.$disconnect())
