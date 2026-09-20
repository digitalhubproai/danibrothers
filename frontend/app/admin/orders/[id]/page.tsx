import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductThumb } from "@/components/product/product-thumb"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { updateOrderStatusAction } from "@/app/actions/admin"
import { prisma } from "@/lib/db"
import { formatDateTime, formatPrice } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUSES, whatsappLink } from "@/lib/site"
import { digits } from "@/lib/validation"

export const metadata: Metadata = { title: "Order" }

export const dynamic = "force-dynamic"

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { slug: true, stock: true } } } },
      user: { select: { id: true, email: true, name: true } },
    },
  })

  if (!order) notFound()

  const waNumber = digits(order.phone).replace(/^0/, "92")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight tnum">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Placed {formatDateTime(order.createdAt)}
          {order.user && (
            <>
              {" · "}
              <Link href="/admin/orders" className="underline-offset-4 hover:underline">
                registered account
              </Link>
            </>
          )}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Update status</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Cancelling an order returns its items to stock. Un-cancelling takes them back out again.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <form key={status} action={updateOrderStatusAction}>
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={status} />
              <Button
                type="submit"
                size="sm"
                variant={order.status === status ? "default" : "outline"}
                disabled={order.status === status}
              >
                {ORDER_STATUS_LABEL[status]}
              </Button>
            </form>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-border">
          <h2 className="border-b border-border bg-card px-5 py-3 text-sm font-semibold">
            Items
          </h2>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 bg-card px-5 py-3.5">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border">
                  <ProductThumb src={item.image} alt={item.name} sizes="3rem" />
                </span>
                <span className="min-w-0 flex-1">
                  {item.product ? (
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-1 text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="line-clamp-1 text-sm font-medium">{item.name}</span>
                  )}
                  <span className="mt-0.5 block text-xs text-muted-foreground tnum">
                    {item.qty} × {formatPrice(item.price)}
                    {!item.product && " · product since deleted"}
                  </span>
                </span>
                <span className="text-sm font-medium tnum">
                  {formatPrice(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-2 border-t border-border bg-card px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tnum">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tnum">
                {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <dt className="font-medium">Total</dt>
              <dd className="text-lg font-semibold tracking-tight tnum">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Customer</h2>
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <span className="font-medium">{order.customerName}</span>
              <a
                href={`tel:${digits(order.phone)}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {order.phone}
              </a>
              {order.email && (
                <a
                  href={`mailto:${order.email}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {order.email}
                </a>
              )}
            </div>

            <h3 className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Deliver to
            </h3>
            <address className="mt-1.5 text-sm leading-relaxed not-italic">
              {order.address}
              <br />
              {order.city}
            </address>

            <h3 className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Payment
            </h3>
            <p className="mt-1.5 text-sm">
              {order.paymentMethod === "COD" ? "Cash on delivery" : "Bank transfer"}
            </p>

            {order.notes && (
              <>
                <h3 className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Customer notes
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {order.notes}
                </p>
              </>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                nativeButton={false}
                render={
                  <a
                    href={whatsappLink(
                      `Hi ${order.customerName}, about your order ${order.orderNumber} from Dani Brothers —`,
                      waNumber,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <MessageCircle />
                WhatsApp
              </Button>
              <Button size="sm" variant="outline" nativeButton={false} render={<a href={`tel:${digits(order.phone)}`} />}>
                <Phone />
                Call
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Customer view</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              The link below is what the customer sees. It is not indexed and only reachable by
              anyone holding the order id.
            </p>
            <Link
              href={`/order/${order.id}`}
              className="mt-3 inline-flex text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              Open customer order page →
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
