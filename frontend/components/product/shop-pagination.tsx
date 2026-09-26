import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Numbered page navigation for the shop grid.
 *
 * Server-side pagination via `?page=N` — the visible window around the current
 * page keeps the control a stable width even with many pages.
 */
export function ShopPagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number
  pageCount: number
  buildHref: (page: number) => string
}) {
  if (pageCount <= 1) return null

  const pages = pageWindow(page, pageCount)

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <Step label="Previous page" disabled={page <= 1} href={page > 1 ? buildHref(page - 1) : undefined}>
        <ChevronLeft className="size-4" />
      </Step>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground/50 select-none">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            scroll={false}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "grid size-9 place-items-center rounded-lg border text-sm font-semibold tnum transition-colors",
              p === page
                ? "border-brand bg-brand text-white shadow-sm"
                : "border-border bg-card text-foreground hover:border-brand/30 hover:bg-brand/5",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Step label="Next page" disabled={page >= pageCount} href={page < pageCount ? buildHref(page + 1) : undefined}>
        <ChevronRight className="size-4" />
      </Step>
    </nav>
  )
}

function Step({
  label,
  disabled,
  href,
  children,
}: {
  label: string
  disabled: boolean
  href?: string
  children: React.ReactNode
}) {
  const cls = cn(
    "grid size-9 place-items-center rounded-lg border text-muted-foreground transition-colors",
    disabled
      ? "pointer-events-none border-border/50 opacity-40"
      : "border-border bg-card hover:border-brand/30 hover:bg-brand/5 hover:text-foreground",
  )
  if (disabled || !href) {
    return (
      <span aria-disabled className={cls}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} aria-label={label} scroll={false} className={cls}>
      {children}
    </Link>
  )
}

/** 1 … 4 5 [6] 7 8 … 12 style windowing. */
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push("…")
  for (let p = start; p <= end; p++) out.push(p)
  if (end < total - 1) out.push("…")
  out.push(total)
  return out
}
