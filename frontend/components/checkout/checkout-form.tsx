"use client"

import { useActionState, useMemo, type ComponentProps } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Loader2,
  Lock,
  ShoppingBag,
  MapPin,
  CreditCard,
  FileText,
  MessageCircle,
  Check,
  Truck,
  Banknote,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProductThumb } from "@/components/product/product-thumb"
import { useCart, cartSubtotal } from "@/lib/cart"
import { useCartHydrated } from "@/components/site/use-cart-count"
import { placeOrderAction } from "@/app/actions/orders"
import { formatPrice } from "@/lib/format"
import { site, shippingFor, FREE_SHIPPING_THRESHOLD, whatsappLink } from "@/lib/site"
import { cn } from "@/lib/utils"
import type { ActionResult } from "@/lib/validation"

type CheckoutUser = { name: string; email: string; phone: string | null } | null

export function CheckoutForm({ user }: { user: CheckoutUser }) {
  const hydrated = useCartHydrated()
  const lines = useCart((s) => s.lines)

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    placeOrderAction,
    null,
  )

  const cartPayload = useMemo(
    () => JSON.stringify(lines.map((l) => ({ productId: l.productId, qty: l.qty }))),
    [lines],
  )

  const subtotal = cartSubtotal(lines)
  const shipping = shippingFor(subtotal)
  const total = subtotal + shipping
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}
  const freeShippingLeft = FREE_SHIPPING_THRESHOLD - subtotal

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    )
  }

  if (lines.length === 0 && !state) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-transparent" />
        <div className="relative">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted/60 text-muted-foreground/50">
            <ShoppingBag className="size-7" />
          </span>
          <h2 className="mt-5 text-lg font-bold">Your cart is empty</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground/70">
            Add something to your cart first, then come back here to checkout.
          </p>
          <Button
            className="mt-6 rounded-xl bg-brand text-white hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/25"
            nativeButton={false}
            render={<Link href="/shop" />}
          >
            Browse the shop
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12" noValidate>
      <input type="hidden" name="cart" value={cartPayload} />

      <div className="flex flex-col gap-5">
        {/* Error */}
        {state && !state.ok && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5" role="alert">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-500">
              <AlertCircle className="size-4" />
            </span>
            <p className="text-sm font-medium text-red-600">{state.message}</p>
          </div>
        )}

        {/* Guest banner */}
        {!user && (
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
              <Lock className="size-4" />
            </span>
            <p className="text-sm text-muted-foreground">
              Checking out as a guest.{" "}
              <Link
                href="/login?next=%2Fcheckout"
                className="font-semibold text-brand transition-colors hover:text-foreground"
              >
                Sign in
              </Link>{" "}
              to keep this order in your history.
            </p>
          </div>
        )}

        {/* Delivery details */}
        <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                <MapPin className="size-4.5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">Delivery details</h2>
                <p className="text-xs text-muted-foreground/60">Where should we deliver?</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                name="customerName"
                autoComplete="name"
                defaultValue={user?.name ?? ""}
                error={errors.customerName}
                className="sm:col-span-2"
                required
              />
              <Field
                label="Mobile number"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0300 1234567"
                defaultValue={user?.phone ?? ""}
                error={errors.phone}
                required
              />
              <Field
                label="Email (optional)"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={user?.email ?? ""}
                error={errors.email}
              />
              <Field
                label="Street address"
                name="address"
                autoComplete="street-address"
                placeholder="House / office, street, area"
                error={errors.address}
                className="sm:col-span-2"
                required
              />
              <Field
                label="City"
                name="city"
                autoComplete="address-level2"
                placeholder="Lahore"
                error={errors.city}
                required
              />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <CreditCard className="size-4.5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">Payment method</h2>
                <p className="text-xs text-muted-foreground/60">How would you like to pay?</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <PaymentOption
                value="COD"
                defaultChecked
                title="Cash on delivery"
                body="Pay the courier when the parcel arrives. Available nationwide."
                icon={<Banknote className="size-4" />}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
              />
              <PaymentOption
                value="BANK_TRANSFER"
                title="Bank transfer"
                body="We'll send account details on WhatsApp once the order is confirmed."
                icon={<CreditCard className="size-4" />}
                color="text-blue-500"
                bg="bg-blue-500/10"
              />
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <FileText className="size-4.5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">Order notes</h2>
                <p className="text-xs text-muted-foreground/60">Optional instructions for delivery</p>
              </div>
            </div>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Delivery timing, landmarks, or anything else we should know."
              className="mt-4 border-border/50 bg-background/50"
            />
          </div>
        </section>
      </div>

      {/* Order summary sidebar */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6">
          {/* Glow */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand/5 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
                <ShoppingBag className="size-4" />
              </span>
              <h2 className="text-sm font-bold">Your order</h2>
              <span className="ml-auto rounded-full bg-brand/10 px-2 py-0.5 text-[0.65rem] font-bold text-brand tnum">
                {lines.length} {lines.length === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="mt-5 flex flex-col gap-3">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-3 rounded-xl bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/50">
                    <ProductThumb src={line.image} alt={line.name} sizes="3.5rem" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-xs font-semibold leading-tight">{line.name}</span>
                    <span className="mt-1 block text-[0.65rem] text-muted-foreground/70 tnum">
                      {line.qty} × {formatPrice(line.price)}
                    </span>
                  </span>
                  <span className="text-xs font-bold tnum">
                    {formatPrice(line.price * line.qty)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Free shipping progress */}
            {freeShippingLeft > 0 && (
              <div className="mt-5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                  <Truck className="size-3.5" />
                  Add {formatPrice(freeShippingLeft)} more for free delivery
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-500/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Totals */}
            <dl className="mt-5 flex flex-col gap-3 border-t border-border/50 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground/70">Subtotal</dt>
                <dd className="font-semibold tnum">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground/70">Delivery</dt>
                <dd className="font-semibold tnum">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border/50 pt-4">
                <dt className="font-bold text-foreground">Total</dt>
                <dd className="text-2xl font-bold tracking-tight tnum text-foreground">
                  {formatPrice(total)}
                </dd>
              </div>
            </dl>

            {/* Place order button */}
            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className="mt-6 h-13 w-full rounded-xl text-sm font-bold bg-brand text-white hover:bg-brand/90 hover:shadow-xl hover:shadow-brand/25 transition-all duration-300"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              {pending ? "Placing order..." : "Place order"}
            </Button>

            {/* Reassurance */}
            <div className="mt-4 space-y-2">
              <p className="text-center text-xs leading-relaxed text-muted-foreground/60">
                No advance payment. We confirm every order by phone before it ships — usually within a
                few hours during {site.hours}.
              </p>
              <a
                href={whatsappLink("Hi Dani Brothers, I have a question about my order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                <MessageCircle className="size-3" />
                Questions? WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </aside>
    </form>
  )
}

function Field({
  label,
  name,
  error,
  className,
  ...props
}: {
  label: string
  name: string
  error?: string
  className?: string
} & ComponentProps<typeof Input>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={name} className="text-xs font-semibold text-foreground/80">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        aria-invalid={!!error}
        className={cn(
          "h-11 rounded-xl border-border/50 bg-background/50 text-sm transition-all duration-300",
          "focus:border-brand/40 focus:ring-3 focus:ring-brand/10 focus:shadow-sm",
          error && "border-red-500/40 focus:border-red-500/40 focus:ring-red-500/10",
        )}
        {...props}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </div>
  )
}

function PaymentOption({
  value,
  title,
  body,
  defaultChecked,
  icon,
  color,
  bg,
}: {
  value: string
  title: string
  body: string
  defaultChecked?: boolean
  icon: React.ReactNode
  color: string
  bg: string
}) {
  return (
    <label className="group flex cursor-pointer gap-4 rounded-xl border border-border/50 p-4 transition-all duration-300 hover:border-border has-checked:border-brand/30 has-checked:bg-brand/[0.02] has-checked:shadow-sm">
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
      />
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${bg} ${color} transition-transform duration-300 group-hover:scale-105`}>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground/70">{body}</span>
      </span>
    </label>
  )
}
