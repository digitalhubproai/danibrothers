"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Minus, MessageCircle, Plus, ShoppingBag, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { site, whatsappLink } from "@/lib/site"

type BuyBoxProduct = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  stock: number
  condition: string
  primaryImage: string | null
}

export function BuyBox({ product }: { product: BuyBoxProduct }) {
  const router = useRouter()
  const add = useCart((s) => s.add)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [buying, setBuying] = useState(false)

  const soldOut = product.stock <= 0
  const max = Math.max(1, product.stock)

  function line() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.primaryImage,
      condition: product.condition,
      stock: product.stock,
    }
  }

  function handleAdd() {
    if (soldOut) return
    add(line(), qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  function handleBuyNow() {
    if (soldOut) return
    setBuying(true)
    add(line(), qty)
    router.push("/checkout")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity + Add to cart */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Quantity stepper */}
        <div className="flex h-12 items-center rounded-xl border border-border/60 bg-muted/30">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1 || soldOut}
            aria-label="Decrease quantity"
            className="grid h-full w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span aria-live="polite" className="w-10 text-center text-sm font-bold tnum">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max || soldOut}
            aria-label="Increase quantity"
            className="grid h-full w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Add to cart */}
        <Button
          type="button"
          size="lg"
          variant={added ? "secondary" : "default"}
          disabled={soldOut}
          onClick={handleAdd}
          className={cn(
            "h-12 flex-1 px-6 text-sm font-semibold rounded-xl transition-all duration-300 sm:flex-none sm:min-w-[12rem]",
            added
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : "bg-brand text-white hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/25",
          )}
        >
          {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
          {soldOut ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
        </Button>
      </div>

      {/* Buy now */}
      {!soldOut && (
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={handleBuyNow}
          disabled={buying}
          className="h-12 w-full rounded-xl px-6 text-sm font-semibold border-border/60 hover:border-brand/30 hover:bg-brand/5 hover:text-brand transition-all duration-300 sm:w-auto sm:min-w-[12rem]"
        >
          {buying ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Zap className="size-4" />
          )}
          Buy it now
        </Button>
      )}

      {/* WhatsApp link */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground/80">
          Questions about this unit?{" "}
          <a
            href={whatsappLink(`Hi ${site.name}, I'm interested in the ${product.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <MessageCircle className="size-3.5" />
            Message us on WhatsApp
          </a>{" "}
          — we&apos;ll send extra photos and the bench-test report.
        </p>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
