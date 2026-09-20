import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/db"
import { formatDateTime, formatPrice } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Orders" }

export const dynamic = "force-dynamic"

const PER_PAGE = 25

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v?.trim() ?? ""
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const status = first(sp.status)
  const q = first(sp.q)
  const page = Math.max(1, Number(first(sp.page)) || 1)

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q } },
            { customerName: { contains: q } },
            { phone: { contains: q } },
            { city: { contains: q } },
          ],
        }
      : {}),
  }

  const [orders, total, statusGroups] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { status: "asc" },
    }),
  ])

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE))
  const byStatus = new Map(statusGroups.map((g) => [g.status, g._count._all]))

  function tabHref(next: string) {
    const params = new URLSearchParams()
    if (next) params.set("status", next)
    if (q) params.set("q", q)
    const qs = params.toString()
    return qs ? `/admin/orders?${qs}` : "/admin/orders"
  }

  function pageHref(target: number) {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (q) params.set("q", q)
    if (target > 1) params.set("page", String(target))
    const qs = params.toString()
    return qs ? `/admin/orders?${qs}` : "/admin/orders"
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {total} {total === 1 ? "order" : "orders"} matching the current view.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Tab href={tabHref("")} active={!status}>
          All
        </Tab>
        {ORDER_STATUSES.map((s) => (
          <Tab key={s} href={tabHref(s)} active={status === s} count={byStatus.get(s) ?? 0}>
            {ORDER_STATUS_LABEL[s as OrderStatus]}
          </Tab>
        ))}
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/orders">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Order number, name, phone or city"
          className="h-9 min-w-56 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
        {q && (
          <Button type="button" variant="ghost" nativeButton={false} render={<Link href={tabHref(status)} />}>
            Reset
          </Button>
        )}
      </form>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
          No orders here yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-left">
                <th className="px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Order
                </th>
                <th className="px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Customer
                </th>
                <th className="px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Placed
                </th>
                <th className="px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border bg-card transition-colors last:border-0 hover:bg-accent"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium tracking-wide tnum hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {order._count.items} {order._count.items === 1 ? "item" : "items"} ·{" "}
                      {order.paymentMethod === "COD" ? "COD" : "Bank transfer"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{order.customerName}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {order.phone} · {order.city}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium tnum">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground tnum">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <StepLink href={page > 1 ? pageHref(page - 1) : null}>Previous</StepLink>
            <StepLink href={page < pageCount ? pageHref(page + 1) : null}>Next</StepLink>
          </div>
        </div>
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
  count?: number
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
      {count != null && count > 0 && (
        <span
          className={cn(
            "rounded px-1 text-[0.625rem] tnum",
            active ? "bg-primary-foreground/20" : "bg-muted",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

function StepLink({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    )
  }
  return (
    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={href} />}>
      {children}
    </Button>
  )
}
