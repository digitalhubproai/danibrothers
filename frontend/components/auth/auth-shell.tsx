import Link from "next/link"
import type { ReactNode } from "react"
import { Logo } from "@/components/site/logo"
import { site } from "@/lib/site"

/**
 * Split layout for the auth pages: the form on the left, a quiet reassurance
 * panel on the right. Both auth pages share it so the pair feels like one
 * place rather than two unrelated screens.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="container-page grid flex-1 gap-12 py-12 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-20">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="inline-block lg:hidden">
          <Logo />
        </Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight lg:mt-0">{title}</h1>
        <p className="mt-2 mb-7 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        {children}
      </div>

      <aside className="relative hidden overflow-hidden rounded-2xl border border-border bg-primary p-10 text-primary-foreground lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative">
          {/* Not <Logo /> — its mark is ink-on-light and would vanish here. */}
          <p className="text-sm font-semibold tracking-tight">{site.name}</p>
          <p className="mt-0.5 text-[0.625rem] font-medium tracking-[0.12em] text-primary-foreground/60 uppercase">
            {site.tagline}
          </p>
          <p className="mt-10 text-xl font-medium text-balance">
            An account keeps your orders, invoices and warranty claims in one place.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-sm text-primary-foreground/80">
            <li>Track every order from confirmed to delivered.</li>
            <li>Re-order consumables without digging through WhatsApp.</li>
            <li>Faster checkout — your delivery details are remembered.</li>
          </ul>

          <div className="mt-12 border-t border-primary-foreground/15 pt-5 text-xs text-primary-foreground/60">
            <p>{site.address}</p>
            <p className="mt-1">
              {site.hours} · {site.phone}
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
