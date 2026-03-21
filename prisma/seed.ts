import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { hash } from "bcryptjs"

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres123@localhost:5432/plm_platform",
})
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding...")

  await db.auditLog.deleteMany()
  await db.notification.deleteMany()
  await db.eCO.deleteMany()
  await db.operation.deleteMany()
  await db.component.deleteMany()
  await db.bOM.deleteMany()
  await db.product.deleteMany()
  await db.approvalRule.deleteMany()
  await db.eCOStage.deleteMany()
  await db.user.deleteMany()

  const password = await hash("password123", 10)   // ← uses named import directly

  const admin = await db.user.create({
    data: { loginId: "admin1", email: "admin1@plm.com", password, role: "ADMIN" },
  })
  const eng = await db.user.create({
    data: { loginId: "eng001", email: "eng001@plm.com", password, role: "ENGINEERING" },
  })
  const approver = await db.user.create({
    data: { loginId: "apvr01", email: "apvr01@plm.com", password, role: "APPROVER" },
  })
  await db.user.create({
    data: { loginId: "ops001", email: "ops001@plm.com", password, role: "OPERATIONS" },
  })

  console.log("✅ Users created")

  await db.eCOStage.createMany({
    data: [
      { name: "New", order: 1, requireApproval: false, slaHours: 24 },
      { name: "Engineering Review", order: 2, requireApproval: false, slaHours: 12 },
      { name: "Approval", order: 3, requireApproval: true, slaHours: 8 },
      { name: "Done", order: 4, requireApproval: false, slaHours: 0 },
      { name: "Rejected", order: 5, requireApproval: false, slaHours: 0 },
    ],
  })

  console.log("✅ Stages created")

  const table = await db.product.create({
    data: { name: "Wooden Table", salePrice: 8500, costPrice: 4200, version: 1, status: "ACTIVE" },
  })
  const chair = await db.product.create({
    data: { name: "Office Chair", salePrice: 12000, costPrice: 6500, version: 1, status: "ACTIVE" },
  })
  const shelf = await db.product.create({
    data: { name: "Wall Shelf", salePrice: 3500, costPrice: 1800, version: 1, status: "ACTIVE" },
  })
  await db.product.create({
    data: { name: "Wooden Table", salePrice: 7500, costPrice: 3800, version: 0, status: "ARCHIVED" },
  })
  const screw = await db.product.create({
    data: { name: "Screw M6", salePrice: 5, costPrice: 2, version: 1, status: "ACTIVE" },
  })
  const wood = await db.product.create({
    data: { name: "Teak Wood Panel", salePrice: 1200, costPrice: 800, version: 1, status: "ACTIVE" },
  })
  const foam = await db.product.create({
    data: { name: "Foam Cushion", salePrice: 450, costPrice: 200, version: 1, status: "ACTIVE" },
  })

  console.log("✅ Products created")

  const tableBOM = await db.bOM.create({
    data: {
      productId: table.id,
      version: 1,
      status: "ACTIVE",
      components: {
        create: [
          { productId: screw.id, quantity: 16 },
          { productId: wood.id, quantity: 4 },
        ],
      },
      operations: {
        create: [
          { name: "Cutting", durationMins: 30, workCenter: "CNC-01" },
          { name: "Assembly", durationMins: 45, workCenter: "ASM-01" },
          { name: "Finishing", durationMins: 20, workCenter: "FIN-01" },
        ],
      },
    },
  })

  await db.bOM.create({
    data: {
      productId: chair.id,
      version: 1,
      status: "ACTIVE",
      components: {
        create: [
          { productId: screw.id, quantity: 24 },
          { productId: foam.id, quantity: 2 },
        ],
      },
      operations: {
        create: [
          { name: "Frame Welding", durationMins: 60, workCenter: "WLD-01" },
          { name: "Upholstery", durationMins: 40, workCenter: "UPH-01" },
        ],
      },
    },
  })

  console.log("✅ BOMs created")

  const eco1 = await db.eCO.create({
    data: {
      title: "Reduce screw count in Wooden Table BOM",
      type: "BOM",
      stage: "Engineering Review",
      productId: table.id,
      bomId: tableBOM.id,
      userId: eng.id,
      effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      versionUpdate: true,
      riskScore: 35,
      riskLevel: "MEDIUM",
      conflictStatus: "NONE",
      enteredStageAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      proposedChanges: {
        components: [
          { productId: screw.id, quantity: 12, action: "MODIFY" },
        ],
      },
    },
  })

  const eco2 = await db.eCO.create({
    data: {
      title: "Increase sale price of Office Chair",
      type: "PRODUCT",
      stage: "Approval",
      productId: chair.id,
      userId: eng.id,
      effectiveDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      versionUpdate: true,
      riskScore: 72,
      riskLevel: "HIGH",
      conflictStatus: "NONE",
      enteredStageAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
      proposedChanges: { salePrice: 13500 },
    },
  })

  await db.eCO.create({
    data: {
      title: "Update Wall Shelf pricing",
      type: "PRODUCT",
      stage: "New",
      productId: shelf.id,
      userId: eng.id,
      effectiveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      versionUpdate: false,
      riskScore: 15,
      riskLevel: "LOW",
      conflictStatus: "NONE",
      enteredStageAt: new Date(),
      proposedChanges: { salePrice: 4200 },
    },
  })

  const eco4 = await db.eCO.create({
    data: {
      title: "Critical cost reduction Wooden Table",
      type: "PRODUCT",
      stage: "New",
      productId: table.id,
      userId: eng.id,
      effectiveDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      versionUpdate: true,
      riskScore: 88,
      riskLevel: "CRITICAL",
      conflictStatus: "CONFLICT",
      enteredStageAt: new Date(),
      proposedChanges: { salePrice: 8500, costPrice: 3500 },
    },
  })

  const eco5 = await db.eCO.create({
    data: {
      title: "Rollback Wooden Table to v0",
      type: "ROLLBACK",
      stage: "Done",
      productId: table.id,
      userId: admin.id,
      effectiveDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      versionUpdate: true,
      riskScore: 20,
      riskLevel: "MEDIUM",
      conflictStatus: "NONE",
      enteredStageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      proposedChanges: { salePrice: 7500, costPrice: 3800 },
    },
  })

  console.log("✅ ECOs created")

  await db.auditLog.createMany({
    data: [
      {
        ecoId: eco1.id,
        action: "ECO_CREATED",
        affectedRecord: `ECO:${eco1.id}`,
        oldValue: null,
        newValue: "New",
        userId: eng.id,
      },
      {
        ecoId: eco2.id,
        action: "STAGE_MOVED",
        affectedRecord: `ECO:${eco2.id}`,
        oldValue: "Engineering Review",
        newValue: "Approval",
        userId: eng.id,
      },
      {
        ecoId: eco5.id,
        action: "ECO_APPLIED",
        affectedRecord: `ECO:${eco5.id}`,
        oldValue: "Approval",
        newValue: "Done",
        userId: admin.id,
      },
    ],
  })

  await db.notification.createMany({
    data: [
      {
        userId: approver.id,
        ecoId: eco2.id,
        type: "SLA_BREACH",
        message: "Office Chair ECO exceeded 8h SLA in Approval",
        isRead: false,
      },
      {
        userId: admin.id,
        ecoId: eco4.id,
        type: "CONFLICT_DETECTED",
        message: "Wooden Table ECO has a conflict",
        isRead: false,
      },
      {
        userId: admin.id,
        ecoId: eco5.id,
        type: "APPROVED",
        message: "Rollback ECO applied successfully",
        isRead: true,
      },
    ],
  })

  console.log("✅ Audit + Notifications created")
  console.log("")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("🎉 Seed complete!")
  console.log("  admin1 / password123  → ADMIN")
  console.log("  eng001 / password123  → ENGINEERING")
  console.log("  apvr01 / password123  → APPROVER")
  console.log("  ops001 / password123  → OPERATIONS")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
