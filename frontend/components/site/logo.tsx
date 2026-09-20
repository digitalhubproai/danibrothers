import Link from "next/link"
import { cn } from "@/lib/utils"
import { site } from "@/lib/site"

/**
 * Wordmark. The mark is a stylised "D" built from two offset blocks — it reads
 * as a monogram at 28px and as an abstract shape in the footer, so the same
 * geometry works at both sizes without a separate small-size asset.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5 rounded-lg outline-none", className)}
      aria-label={`${site.name} — home`}
    >
      <span className="relative grid size-8 shrink-0 place-items-center rounded-[0.55rem] bg-primary text-primary-foreground transition-transform duration-300 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="none">
          <path
            d="M5 4h7a8 8 0 0 1 0 16H5V4Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M9.5 8.5h2.2a3.5 3.5 0 0 1 0 7H9.5v-7Z" fill="currentColor" />
        </svg>
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.9375rem] font-semibold tracking-tight">{site.name}</span>
          <span className="text-[0.625rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Computers &amp; Accessories
          </span>
        </span>
      )}
    </Link>
  )
}
