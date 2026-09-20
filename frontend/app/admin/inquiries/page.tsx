import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { Check, Mail, MessageSquare, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleInquiryAction } from "@/app/actions/admin"
import { prisma } from "@/lib/db"
import { formatDateTime } from "@/lib/format"
import { whatsappLink } from "@/lib/site"
import { cn } from "@/lib/utils"
import { digits } from "@/lib/validation"

export const metadata: Metadata = { title: "Inquiries" }

export const dynamic = "force-dynamic"

const TYPE_LABEL: Record<string, string> = {
  SELL_DEVICE: "Selling a device",
  GENERAL: "General question",
  REPAIR: "Repair",
  BULK: "Bulk / corporate",
}

const CONDITION_LABEL: Record<string, string> = {
  WORKING: "Fully working",
  MINOR_FAULT: "Minor fault",
  FAULTY: "Faulty",
  UNKNOWN: "Not sure",
}

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v?.trim() ?? ""
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const show = first(sp.show) === "handled" ? "handled" : "open"

  const inquiries = await prisma.inquiry.findMany({
    where: { handled: show === "handled" },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const [openCount, handledCount] = await Promise.all([
    prisma.inquiry.count({ where: { handled: false } }),
    prisma.inquiry.count({ where: { handled: true } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Inquiries</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Leads from the contact form and the sell-your-device page.
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Tab href="/admin/inquiries" active={show === "open"} count={openCount}>
          Open
        </Tab>
        <Tab href="/admin/inquiries?show=handled" active={show === "handled"} count={handledCount}>
          Handled
        </Tab>
      </div>

      {inquiries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
          {show === "open" ? "Nothing waiting — you're all caught up." : "No handled inquiries yet."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {inquiries.map((inquiry) => {
            const waNumber = digits(inquiry.phone).replace(/^0/, "92")
            return (
              <li
                key={inquiry.id}
                className={cn(
                  "rounded-xl border bg-card p-5",
                  inquiry.handled ? "border-border opacity-70" : "border-border",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{inquiry.name}</span>
                      <span className="rounded-md bg-brand-subtle px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-brand uppercase">
                        {TYPE_LABEL[inquiry.type] ?? inquiry.type}
                      </span>
                      {inquiry.handled && (
                        <span className="rounded-md bg-success-subtle px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-success uppercase">
                          Handled
                        </span>
                      )}
                    </div>

                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <a
                        href={`tel:${digits(inquiry.phone)}`}
                        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        <Phone className="size-3" />
                        {inquiry.phone}
                      </a>
                      {inquiry.email && (
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                        >
                          <Mail className="size-3" />
                          {inquiry.email}
                        </a>
                      )}
                      <span>{formatDateTime(inquiry.createdAt)}</span>
                    </p>

                    {inquiry.device && (
                      <p className="mt-2.5 text-sm">
                        <span className="text-muted-foreground">Device:</span>{" "}
                        <span className="font-medium">{inquiry.device}</span>
                        {inquiry.condition && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {CONDITION_LABEL[inquiry.condition] ?? inquiry.condition}
                          </span>
                        )}
                      </p>
                    )}

                    {inquiry.message && (
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                        {inquiry.message}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      nativeButton={false}
                      render={
                        <a
                          href={whatsappLink(
                            `Hi ${inquiry.name}, thanks for getting in touch with Dani Brothers —`,
                            waNumber,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <MessageSquare />
                      Reply
                    </Button>

                    <form action={toggleInquiryAction}>
                      <input type="hidden" name="id" value={inquiry.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        <Check />
                        {inquiry.handled ? "Reopen" : "Mark handled"}
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Tab({
  href,
  active,
  count,
  children,
}: {
  href: string
  active: boolean
  count: number
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <span
        className={cn(
          "rounded px-1 text-[0.625rem] tnum",
          active ? "bg-primary-foreground/20" : "bg-muted",
        )}
      >
        {count}
      </span>
    </Link>
  )
}
