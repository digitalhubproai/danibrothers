import path from "node:path"

/**
 * SQLite connection URLs are resolved relative to `process.cwd()` by the
 * runtime driver, but Prisma Migrate resolves them relative to the schema
 * file. Left alone, `file:./dev.db` makes migrate write `prisma/dev.db` while
 * the app reads `./dev.db` — two different databases, and a confusing bug.
 *
 * Both `prisma.config.ts` and `lib/db.ts` go through this function so the CLI
 * and the app can never disagree about which file they mean.
 */
export function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db"
  if (!raw.startsWith("file:")) return raw

  const filePath = raw.slice("file:".length)
  if (path.isAbsolute(filePath)) return raw

  return `file:${path.resolve(process.cwd(), filePath)}`
}
