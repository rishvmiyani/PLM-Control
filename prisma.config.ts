import { defineConfig } from "prisma/config"

export default defineConfig({
  datasource: {
    url: "postgresql://postgres:postgres123@localhost:5432/plm_platform",
  },
  migrations: {
    seed: "node prisma/seed.js",
  },
})
