/**
 * The session cookie's name, on its own.
 *
 * `lib/auth.ts` pulls in Prisma and bcryptjs to hash passwords and read users.
 * The proxy only needs to know which cookie to look at, and it runs on every
 * matched request before rendering — so it imports this instead, and the
 * database client never enters the proxy's module graph.
 */
export const SESSION_COOKIE_NAME = "db_session"

/** 7 days. Shared so the proxy and `lib/auth.ts` cannot disagree. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
