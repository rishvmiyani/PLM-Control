import { defineConfig } from "prisma/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = "postgresql://postgres:postgres123@localhost:5432/plm_platform"

export default defineConfig({
  datasource: {
    url: connectionString,
  },
})
