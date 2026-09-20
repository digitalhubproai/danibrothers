import "dotenv/config"
import { defineConfig } from "prisma/config"
import { resolveDatabaseUrl } from "./lib/db-url"

// Prisma 7 moved the connection URL out of schema.prisma and into this file.
// The runtime client connects through a driver adapter instead — see lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
})
