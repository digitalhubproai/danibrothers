/**
 * Sort options, deliberately kept in their own file.
 *
 * `lib/products.ts` imports the Prisma client, so anything that imports *any
 * value* from it drags `lib/db.ts` → Prisma → `better-sqlite3` (a native
 * addon that needs `fs`) into that module's graph. A client component doing
 * that fails the build with "Module not found: Can't resolve 'fs'".
 *
 * This module has no imports at all, so it is safe from a Client Component.
 * `lib/products.ts` re-exports these for server-side callers, which is why
 * `app/shop/page.tsx` can still import them from there — but a `"use client"`
 * file must import from here.
 */

export type SortKey = "newest" | "price-asc" | "price-desc" | "name"

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
]
