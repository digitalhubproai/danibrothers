import Link from "next/link"
import { ConditionBadge } from "@/components/product/condition-badge"
import { AddToCartButton } from "@/components/product/add-to-cart"
import { ProductThumb } from "@/components/product/product-thumb"
import { discountPercent, formatPrice } from "@/lib/format"
import { stockState, type ProductView } from "@/lib/products"
import { whatsappLink, site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { Eye, MessageCircle } from "lucide-react"

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductView
  priority?: boolean
  className?: string
}) {
  const discount = product.compareAtPrice
    ? discountPercent(product.price, product.compareAtPrice)
    : 0
  const stock = stockState(product.stock)

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_24px_48px_-16px_rgb(0,0,0,0.18)]",
        className,
      )}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand via-blue-400 to-brand opacity-0 scale-x-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-x-100 z-30" />

      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name}>
          <ProductThumb
            src={product.primaryImage}
            alt={product.name}
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
            className="transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
          />
        </Link>

        {/* Hover overlay with quick view */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100 flex items-end justify-center pb-4">
          <Link
            href={`/product/${product.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-black shadow-lg transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-white"
          >
            <Eye className="size-3.5" />
            Quick View
          </Link>
        </div>

        {/* Condition badge */}
        <div className="pointer-events-none absolute left-2 top-2 z-20">
          <ConditionBadge condition={product.condition} className="shadow-md backdrop-blur-sm text-[0.6rem] px-1.5 py-0.5 sm:text-[0.6875rem] sm:px-1.5 sm:py-0.5" />
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-md sm:rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[0.6rem] sm:text-[0.7rem] font-bold text-white tnum shadow-lg">
            −{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-5">
        {/* Brand */}
        <p className="text-[0.65rem] font-bold tracking-[0.12em] text-brand/70 uppercase">
          {product.brand}
        </p>

        {/* Name */}
        <h3 className="mt-1.5 line-clamp-2 text-[0.9rem] font-semibold leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand">
          <Link href={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* Price section */}
        <div className="mt-auto pt-3 sm:pt-4">
          <div className="flex items-baseline gap-1.5 sm:gap-2.5">
            <span className="text-base sm:text-lg md:text-xl font-bold tnum text-foreground">{formatPrice(product.price)}</span>
            {product.compareAtPrice && discount > 0 && (
              <span className="text-[0.7rem] sm:text-sm text-muted-foreground/60 line-through tnum">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock + Actions */}
          <div className="mt-3 flex items-center justify-between gap-1.5 sm:gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[0.6rem] sm:text-[0.65rem] font-semibold",
                stock.tone === "success" && "bg-emerald-500/10 text-emerald-600",
                stock.tone === "warning" && "bg-amber-500/10 text-amber-600",
                stock.tone === "destructive" && "bg-red-500/10 text-red-600",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  stock.tone === "success" && "bg-emerald-500",
                  stock.tone === "warning" && "bg-amber-500",
                  stock.tone === "destructive" && "bg-red-500",
                )}
              />
              <span className="hidden sm:inline">{stock.label}</span>
              <span className="sm:hidden">{stock.label === "In Stock" ? "Avail" : stock.label}</span>
            </span>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <a
                href={whatsappLink(`Hi ${site.name}, I'm interested in the ${product.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-7 sm:size-8 place-items-center rounded-md sm:rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:shadow-sm"
                aria-label={`Ask about ${product.name} on WhatsApp`}
              >
                <MessageCircle className="size-3 sm:size-3.5" />
              </a>
              <AddToCartButton product={product} size="sm" compact />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
}: {
  products: ProductView[]
  className?: string
  priorityCount?: number
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-8 xl:grid-cols-4 xl:gap-x-7 xl:gap-y-9",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  )
}
