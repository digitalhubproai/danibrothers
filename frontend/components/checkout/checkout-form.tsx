"use client"

import { useActionState, useMemo, useRef, useState, type ComponentProps } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Lock,
  ShoppingBag,
  MapPin,
  CreditCard,
  FileText,
  ImageUp,
  MessageCircle,
  Banknote,
  ArrowRight,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProductThumb } from "@/components/product/product-thumb"
import { useCart, cartSubtotal } from "@/lib/cart"
import { useCartHydrated } from "@/components/site/use-cart-count"
import { placeOrderAction, uploadPaymentProofAction } from "@/app/actions/orders"
import { formatPrice } from "@/lib/format"
import {
  bankTransfer,
  groupDigits,
  hasBankDetails,
  site,
  SHIPPING_FLAT,
  whatsappLink,
} from "@/lib/site"
import { cn } from "@/lib/utils"
import type { ActionResult } from "@/lib/validation"

type CheckoutUser = { name: string; email: string; phone: string | null } | null

type PaymentMethod = "COD" | "BANK_TRANSFER"

export function CheckoutForm({ user }: { user: CheckoutUser }) {
  const hydrated = useCartHydrated()
  const lines = useCart((s) => s.lines)

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    placeOrderAction,
    null,
  )

  // Which radio is ticked. Held in state rather than left to the browser because
  // the bank details and the receipt box below only make sense for a transfer,
  // and they have to appear the moment that option is picked.
  const [method, setMethod] = useState<PaymentMethod>("COD")
  // The `/uploads/...` path the API handed back for the receipt. This is what
  // the hidden `paymentProof` field submits with the order.
  const [proof, setProof] = useState<string | null>(null)
  const [proofName, setProofName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const proofInputRef = useRef<HTMLInputElement>(null)

  const cartPayload = useMemo(
    () => JSON.stringify(lines.map((l) => ({ productId: l.productId, qty: l.qty }))),
    [lines],
  )

  const subtotal = cartSubtotal(lines)
  const shipping = SHIPPING_FLAT
  const total = subtotal + shipping
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}

  async function handleProofPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Clear first, so picking the same file twice still fires a change event.
    event.target.value = ""
    if (!file) return

    setUploadError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file, file.name)
      const result = await uploadPaymentProofAction(body)
      if (!result.ok) {
        setUploadError(result.message)
        return
      }
      const url = result.data?.url
      if (!url) {
        setUploadError("The upload didn't come back. Try again.")
        return
      }
      setProof(url)
      setProofName(file.name)
    } catch {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  function clearProof() {
    setProof(null)
    setProofName(null)
    setUploadError(null)
  }

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
            className="mt-6"
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
      {/* Only ever set to a path the API returned in this session — the order
          page renders it as a link, so nothing else may reach it. */}
      {method === "BANK_TRANSFER" && proof && (
        <input type="hidden" name="paymentProof" value={proof} />
      )}
      {/* Unnamed, so it never rides along with the order — the file goes to the
          API on its own and only the returned path is submitted. */}
      <input
        ref={proofInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleProofPick}
      />

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
                checked={method === "COD"}
                onSelect={() => setMethod("COD")}
                title="Cash on delivery"
                body="Pay the courier when the parcel arrives. Available nationwide."
                icon={<Banknote className="size-4" />}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
              />
              <PaymentOption
                value="BANK_TRANSFER"
                checked={method === "BANK_TRANSFER"}
                onSelect={() => setMethod("BANK_TRANSFER")}
                title="Bank transfer"
                body={
                  hasBankDetails()
                    ? `Send ${formatPrice(total)} to the ${bankTransfer.bankName} account below, then attach the receipt.`
                    : `Send the amount, then attach the receipt. We'll confirm the ${bankTransfer.bankName} account on WhatsApp.`
                }
                icon={<CreditCard className="size-4" />}
                color="text-blue-500"
                bg="bg-blue-500/10"
              >
                <BankTransferPanel
                  amount={total}
                  proof={proof}
                  proofName={proofName}
                  uploading={uploading}
                  error={uploadError}
                  onPick={() => proofInputRef.current?.click()}
                  onClear={clearProof}
                />
              </PaymentOption>
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

            {/* Totals */}
            <dl className="mt-5 flex flex-col gap-3 border-t border-border/50 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground/70">Subtotal</dt>
                <dd className="font-semibold tnum">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground/70">Delivery</dt>
                <dd className="font-semibold tnum">{formatPrice(shipping)}</dd>
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
              size="xl"
              disabled={pending}
              className="mt-6 w-full"
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
                {method === "BANK_TRANSFER"
                  ? `Transfer the amount and attach the receipt. We confirm every payment before it ships — usually within a few hours during ${site.hours}.`
                  : `No advance payment. We confirm every order by phone before it ships — usually within a few hours during ${site.hours}.`}
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
  checked,
  onSelect,
  icon,
  color,
  bg,
  children,
}: {
  value: string
  title: string
  body: string
  checked: boolean
  onSelect: () => void
  icon: React.ReactNode
  color: string
  bg: string
  /** Extra fields shown under the copy — only while this option is selected. */
  children?: React.ReactNode
}) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer gap-4 rounded-xl border p-4 transition-all duration-300",
        checked ? "border-brand/30 bg-brand/[0.02] shadow-sm" : "border-border/50 hover:border-border",
      )}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={checked}
        onChange={onSelect}
        className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
      />
      <span className="min-w-0 flex-1">
        <span className="flex gap-4">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-105",
              bg,
              color,
            )}
          >
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{title}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground/70">{body}</span>
          </span>
        </span>
        {checked && children}
      </span>
    </label>
  )
}

/**
 * The details a bank-transfer customer needs before they pay: where to send the
 * money, and a slot to attach the receipt.
 *
 * Until the shop fills `bankTransfer` in, the account block is replaced by the
 * WhatsApp fallback rather than an empty table — an account number is the one
 * thing on this page that must never be guessed at.
 */
function BankTransferPanel({
  amount,
  proof,
  proofName,
  uploading,
  error,
  onPick,
  onClear,
}: {
  amount: number
  proof: string | null
  proofName: string | null
  uploading: boolean
  error: string | null
  onPick: () => void
  onClear: () => void
}) {
  const ready = hasBankDetails()

  return (
    <span className="mt-4 block rounded-xl border border-border/50 bg-background/40 p-4">
      {ready ? (
        <>
          <span className="block text-[0.7rem] font-semibold tracking-wide text-muted-foreground/70 uppercase">
            {bankTransfer.bankName} — send {formatPrice(amount)}
          </span>
          <span className="mt-3 flex flex-col gap-2.5">
            <CopyRow label="Account title" value={bankTransfer.accountTitle} />
            <CopyRow
              label="Account number"
              value={groupDigits(bankTransfer.accountNumber)}
              raw={bankTransfer.accountNumber}
            />
            {bankTransfer.iban && (
              <CopyRow label="IBAN" value={groupDigits(bankTransfer.iban)} raw={bankTransfer.iban} />
            )}
            {bankTransfer.branch && <CopyRow label="Branch" value={bankTransfer.branch} />}
          </span>
        </>
      ) : (
        <span className="block text-xs leading-relaxed text-muted-foreground/80">
          Pick this option and we&apos;ll send the {bankTransfer.bankName} account number on WhatsApp
          within a few minutes, so you can transfer the exact amount and attach the receipt below.
        </span>
      )}

      {/* Receipt */}
      <span className="mt-4 block border-t border-border/50 pt-4">
        <span className="block text-[0.7rem] font-semibold tracking-wide text-muted-foreground/70 uppercase">
          Payment receipt
        </span>

        {proof ? (
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2.5">
            <Check className="size-4 shrink-0 text-emerald-500" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-emerald-600">Receipt attached</span>
              <a
                href={proof}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-[0.7rem] text-muted-foreground/70 underline-offset-2 hover:underline"
              >
                {proofName ?? "View the file"}
              </a>
            </span>
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove the attached receipt"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ) : (
          <span className="mt-2 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={onPick}
              className="rounded-xl border-border/50"
            >
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImageUp className="size-3.5" />}
              {uploading ? "Uploading..." : "Attach receipt"}
            </Button>
            <span className="text-[0.7rem] leading-relaxed text-muted-foreground/60">
              A screenshot or photo of the transfer. Optional now — you can also send it on WhatsApp.
            </span>
          </span>
        )}

        {error && (
          <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
            <AlertCircle className="size-3" />
            {error}
          </span>
        )}

        <span className="mt-3 block text-[0.7rem] leading-relaxed text-muted-foreground/60">
          We confirm the transfer before dispatch, so parcels usually leave once the payment shows in
          the account.
        </span>
      </span>
    </span>
  )
}

/** One line of account details, with a tap-to-copy button. */
function CopyRow({ label, value, raw }: { label: string; value: string; raw?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(raw ?? value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure origin, denied permission) — the value is
      // on screen and selectable, so there is nothing to recover from.
    }
  }

  return (
    <span className="flex items-baseline justify-between gap-3">
      <span className="text-[0.7rem] text-muted-foreground/60">{label}</span>
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="truncate text-xs font-semibold tnum">{value || "—"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground"
        >
          {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
        </button>
      </span>
    </span>
  )
}
