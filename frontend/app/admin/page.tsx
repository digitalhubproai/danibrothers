import type { Metadata } from "next"
import type { ComponentType } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { prisma } from "@/lib/db"
import { formatDate, formatPrice, formatPriceCompact } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Dashboard" }

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-warning",
  CONFIRMED: "bg-brand",
  SHIPPED: "bg-chart-4",
  DELIVERED: "bg-success",
  CANCELLED: "bg-destructive",
}

export default async function AdminDashboardPage() {
  const [
    productCount,
    outOfStock,
    lowStock,
    orderCount,
    customerCount,
    revenue,
    statusGroups,
    recentOrders,
    openInquiries,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: 0 } } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 3 } } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { status: "asc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        city: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.inquiry.count({ where: { handled: false } }),
  ])

  const byStatus = new Map(statusGroups.map((g) => [g.status, g._count._all]))
  const needsAttention = outOfStock + lowStock

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-eyebrow text-brand">Admin</p>
        <h1 className="mt-2 text-display-sm">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A snapshot of the shop right now.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <Tile
          icon={Banknote}
          label="Revenue"
          value={formatPriceCompact(revenue._sum.total ?? 0)}
          hint="Excludes cancelled orders"
          accent="text-success"
          bg="bg-success-subtle"
        />
        <Tile
          icon={ShoppingCart}
          label="Orders"
          value={String(orderCount)}
          hint={`${byStatus.get("PENDING") ?? 0} awaiting confirmation`}
          href="/admin/orders"
          accent="text-brand"
          bg="bg-brand-subtle"
        />
        <Tile
          icon={Package}
          label="Products"
          value={String(productCount)}
          hint={needsAttention > 0 ? `${needsAttention} need restocking` : "All healthy"}
          href="/admin/products"
          accent="text-warning"
          bg="bg-warning-subtle"
        />
        <Tile
          icon={Users}
          label="Customers"
          value={String(customerCount)}
          hint={`${openInquiries} open ${openInquiries === 1 ? "inquiry" : "inquiries"}`}
          href="/admin/inquiries"
          accent="text-brand"
          bg="bg-brand-subtle"
        />
      </div>

      {(outOfStock > 0 || lowStock > 0) && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning/30 bg-warning-subtle px-4 py-3.5">
          <AlertTriangle className="size-4.5 shrink-0 text-warning" />
          <p className="flex-1 text-sm font-medium text-warning">
            {outOfStock > 0 && `${outOfStock} out of stock`}
            {outOfStock > 0 && lowStock > 0 && " · "}
            {lowStock > 0 && `${lowStock} running low`}
          </p>
          <Link
            href="/admin/products?filter=low"
            className="rounded-lg bg-warning/10 px-3 py-1.5 text-sm font-semibold text-warning transition-colors hover:bg-warning/20"
          >
            Review stock
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Recent orders</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest checkouts</p>
            </div>
            <Link
              href="/admin/orders"
              className="group inline-flex items-center gap-1 rounded-lg border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition-all hover:border-brand/40 hover:bg-brand/10"
            >
              All orders
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </header>

          {recentOrders.length === 0 ? (
            <p className="bg-card px-5 py-12 text-center text-sm text-muted-foreground">
              No orders yet. They&apos;ll appear here the moment someone checks out.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-4 bg-card px-5 py-3.5 transition-colors hover:bg-brand-subtle/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium tracking-wide tnum">
                          {order.orderNumber}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {order.customerName} · {order.city} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tnum">{formatPrice(order.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Orders by status</h2>
          <ul className="mt-5 flex flex-col gap-3.5">
            {ORDER_STATUSES.map((status) => {
              const count = byStatus.get(status) ?? 0
              const share = orderCount > 0 ? (count / orderCount) * 100 : 0
              return (
                <li key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          STATUS_COLORS[status] ?? "bg-muted-foreground",
                        )}
                      />
                      {ORDER_STATUS_LABEL[status as OrderStatus]}
                    </span>
                    <span className="font-medium tnum">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700",
                        STATUS_COLORS[status] ?? "bg-brand",
                      )}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  href,
  accent,
  bg,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  hint: string
  href?: string
  accent: string
  bg: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl transition-transform duration-300",
            bg,
            accent,
            href && "group-hover:scale-110",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight tnum">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md hover:shadow-brand/5"
      >
        {body}
      </Link>
    )
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">{body}</div>
  )
}
