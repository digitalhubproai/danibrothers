import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { resolveDatabaseUrl } from "@/lib/db-url"

// Prisma 7 connects through a driver adapter rather than a URL in the schema.
function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })
}

// The dev server hot-reloads modules on every edit, which would otherwise open
// a new SQLite connection each time and leak file handles.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
