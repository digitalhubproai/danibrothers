import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CheckCircle2,
  MessageCircle,
  MapPin,
  Clock,
  Package,
  CreditCard,
  Truck,
  ArrowRight,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductThumb } from "@/components/product/product-thumb"
import { ClearCartOnMount } from "@/components/checkout/clear-cart"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { ApiError, api } from "@/lib/api"
import type { ApiOrder } from "@/lib/api-types"
import { formatDateTime, formatPrice } from "@/lib/format"
import {
  ORDER_STATUS_LABEL,
  type OrderStatus,
  bankTransfer,
  groupDigits,
  hasBankDetails,
  site,
  whatsappLink,
} from "@/lib/site"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion/reveal"

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const TIMELINE: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Public by design: this link is the receipt, and the id is an unguessable
  // UUID — no session needed, same as before.
  let order: ApiOrder
  try {
    order = await api.get<ApiOrder>(`/api/orders/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  const cancelled = order.status === "CANCELLED"
  const activeStep = TIMELINE.indexOf(order.status as OrderStatus)

  return (
    <div className="container-page py-10 md:py-14">
      <ClearCartOnMount />

      {/* Header */}
      <Reveal className="mx-auto max-w-2xl text-center" y={12}>
        <span
          className={cn(
            "relative mx-auto grid size-16 place-items-center rounded-full",
            cancelled
              ? "bg-red-500/10 text-red-500"
              : "bg-emerald-500/10 text-emerald-500",
          )}
        >
          {!cancelled && (
            <span aria-hidden className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
          )}
          <CheckCircle2 className="relative size-8" strokeWidth={1.5} />
        </span>

        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          {cancelled ? "This order was cancelled" : "Order confirmed"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70 max-w-md mx-auto">
          {cancelled
            ? "If this was not expected, message us on WhatsApp and we'll sort it out."
            : "We've received your order and will call you to confirm the delivery window."}
        </p>

        {/* Order number */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-border/50 bg-card px-5 py-3">
          <span className="text-xs text-muted-foreground/60">Order</span>
          <span className="font-mono font-bold tracking-wider tnum">{order.orderNumber}</span>
          <div className="h-4 w-px bg-border" />
          <OrderStatusBadge status={order.status} />
        </div>
      </Reveal>

      {/* Timeline */}
      {!cancelled && (
        <div className="mx-auto mt-10 max-w-2xl">
          <ol className="flex items-center">
            {TIMELINE.map((step, index) => {
              const reached = index <= activeStep
              const isCurrent = index === activeStep
              return (
                <li key={step} className="flex flex-1 items-center gap-2">
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="relative w-full">
                      <span
                        className={cn(
                          "h-1 w-full rounded-full",
                          reached
                            ? "bg-gradient-to-r from-brand to-emerald-500"
                            : "bg-border",
                        )}
                      />
                      {isCurrent && (
                        <span className="absolute -top-[3px] left-0 h-[14px] w-[14px] rounded-full bg-brand ring-[3px] ring-background" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[0.65rem] font-semibold tracking-wider uppercase",
                        isCurrent ? "text-brand" : reached ? "text-foreground" : "text-muted-foreground/40",
                      )}
                    >
                      {ORDER_STATUS_LABEL[step]}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto mt-12 grid max-w-3xl gap-6">
        {/* Items */}
        <section className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/50 px-6 py-4">
            <Package className="size-4 text-muted-foreground/60" />
            <h2 className="text-sm font-bold">Items</h2>
            <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-[0.65rem] font-bold tnum">
              {order.items.length}
            </span>
          </div>

          <ul className="divide-y divide-border/50">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border/50">
                  <ProductThumb src={item.image} alt={item.name} sizes="3.5rem" />
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="line-clamp-1 text-sm font-semibold hover:text-brand transition-colors"
                  >
                    {item.name}
                  </Link>
                  <span className="mt-0.5 block text-xs text-muted-foreground/60 tnum">
                    {item.qty} × {formatPrice(item.price)}
                  </span>
                </span>
                <span className="text-sm font-bold tnum">
                  {formatPrice(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="border-t border-border/50 px-6 py-4">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground/70">Subtotal</dt>
                <dd className="font-semibold tnum">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground/70">Delivery</dt>
                <dd className="font-semibold tnum">{formatPrice(order.shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border/50 pt-3">
                <dt className="font-bold">Total</dt>
                <dd className="text-xl font-bold tnum">{formatPrice(order.total)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
              <CreditCard className="size-3.5" />
              {order.paymentMethod === "COD"
                ? "Cash on delivery"
                : `Bank transfer — ${bankTransfer.bankName}`}
            </div>

            {order.paymentMethod === "BANK_TRANSFER" && (
              <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-4">
                <p className="text-xs font-bold text-blue-600">
                  Send {formatPrice(order.total)} to
                </p>
                {hasBankDetails() ? (
                  <dl className="mt-3 flex flex-col gap-1.5 text-xs">
                    <Detail label="Account title" value={bankTransfer.accountTitle} />
                    <Detail label="Account number" value={groupDigits(bankTransfer.accountNumber)} />
                    {bankTransfer.iban && (
                      <Detail label="IBAN" value={groupDigits(bankTransfer.iban)} />
                    )}
                    {bankTransfer.branch && <Detail label="Branch" value={bankTransfer.branch} />}
                  </dl>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
                    We&apos;ll send the account number on WhatsApp shortly.
                  </p>
                )}

                <div className="mt-3 border-t border-blue-500/15 pt-3 text-xs">
                  {order.paymentProof ? (
                    <a
                      href={order.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-semibold text-blue-600 underline-offset-2 hover:underline"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Receipt attached — view it
                    </a>
                  ) : (
                    <p className="leading-relaxed text-muted-foreground/70">
                      No receipt attached yet — send it on WhatsApp and we&apos;ll match it to this
                      order.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Delivery + Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground/60" />
              <h2 className="text-xs font-bold">Delivering to</h2>
            </div>
            <address className="mt-3 text-sm leading-relaxed text-muted-foreground/80 not-italic">
              <span className="font-semibold text-foreground">{order.customerName}</span>
              <br />
              {order.address}
              <br />
              {order.city}
              <br />
              <span className="text-muted-foreground/60">{order.phone}</span>
            </address>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground/60" />
              <h2 className="text-xs font-bold">Order info</h2>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground/80">
                <span className="font-medium text-foreground">Placed:</span>{" "}
                {formatDateTime(order.createdAt)}
              </p>
              {order.notes && (
                <p className="text-sm text-muted-foreground/80">
                  <span className="font-medium text-foreground">Notes:</span>{" "}
                  {order.notes}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Next steps */}
        <section className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="text-sm font-bold">What happens next</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Phone, title: "We call you", body: "Confirm the order and delivery time" },
              { icon: Package, title: "We prepare it", body: "Pack and dispatch within 24 hours" },
              { icon: Truck, title: "It arrives", body: "2-4 days, nationwide delivery" },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/60 text-muted-foreground/70">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold">{title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            className="h-11 px-6 rounded-xl font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
            render={
              <a
                href={whatsappLink(
                  `Hi ${site.name}, I've just placed order ${order.orderNumber}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MessageCircle className="size-4" />
            Follow up on WhatsApp
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 rounded-xl font-semibold"
            nativeButton={false}
            render={<Link href="/shop" />}
          >
            Continue shopping
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/** One line of the bank account, left-aligned label over the value. */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground/60">{label}</dt>
      <dd className="font-semibold tnum">{value || "—"}</dd>
    </div>
  )
}
