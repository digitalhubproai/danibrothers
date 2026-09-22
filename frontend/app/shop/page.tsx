import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { PackageSearch, MessageCircle, X } from "lucide-react"
import { ShopFilters } from "@/components/product/shop-filters"
import { InfiniteProductGrid } from "@/components/product/infinite-product-grid"
import { ShopToolbar } from "@/components/product/shop-toolbar"
import { PageHero } from "@/components/site/page-hero"
import { Button } from "@/components/ui/button"
import { whatsappLink } from "@/lib/site"
import {
  getBrands,
  getCategories,
  getPriceBounds,
  getProducts,
  SORT_OPTIONS,
  type SortKey,
} from "@/lib/products"

type SearchParams = Record<string, string | string[] | undefined>

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse new, refurbished and pre-owned laptops, desktops, monitors, CCTV security cameras and accessories at Dani Brothers.",
}

const PER_PAGE = 12

/** Query strings are user input — a repeated `?brand=a&brand=b` arrives as an array. */
function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return v?.trim() ? v.trim() : undefined
}

function many(value: string | string[] | undefined): string[] {
  if (value == null) return []
  return (Array.isArray(value) ? value : [value]).map((v) => v.trim()).filter(Boolean)
}

function toNumber(value: string | undefined): number | undefined {
  if (value == null) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  const category = first(sp.category)
  const brands = many(sp.brand)
  const conditions = many(sp.condition)
  const q = first(sp.q)
  const minPrice = toNumber(first(sp.min))
  const maxPrice = toNumber(first(sp.max))

  const sortParam = first(sp.sort)
  const sort: SortKey = SORT_OPTIONS.some((o) => o.value === sortParam)
    ? (sortParam as SortKey)
    : "newest"
  const page = Math.max(1, toNumber(first(sp.page)) ?? 1)

  const [result, facets, brands_, priceBounds] = await Promise.all([
    getProducts({ category, brands, conditions, minPrice, maxPrice, q, sort, page, perPage: PER_PAGE }),
    getCategories(),
    getBrands(),
    getPriceBounds(),
  ])

  const { products, total, pageCount } = result

  // The heading should read as a sentence about what the shopper is looking at.
  const activeCategory = facets.find((c) => c.slug === category)
  const heading = q
    ? `Results for “${q}”`
    : activeCategory
      ? activeCategory.name
      : "All products"
  const blurb = q
    ? `${total} ${total === 1 ? "product matches" : "products match"} your search.`
    : activeCategory
      ? (activeCategory.description ??
        `${total} ${total === 1 ? "product" : "products"} in this department.`)
      : "Everything currently on the shelves — new, refurbished and pre-owned, plus CCTV and security gear."

  // Active filter chips shown above the grid for quick visual feedback.
  const activeFilters: { key: string; label: string; removeUrl: string }[] = []
  if (activeCategory) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    brands.forEach((b) => params.append("brand", b))
    conditions.forEach((c) => params.append("condition", c))
    if (minPrice != null) params.set("min", String(minPrice))
    if (maxPrice != null) params.set("max", String(maxPrice))
    if (sort !== "newest") params.set("sort", sort)
    const qs = params.toString()
    activeFilters.push({
      key: "category",
      label: activeCategory.name,
      removeUrl: qs ? `/shop?${qs}` : "/shop",
    })
  }
  if (q) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    brands.forEach((b) => params.append("brand", b))
    conditions.forEach((c) => params.append("condition", c))
    const qs = params.toString()
    activeFilters.push({ key: "q", label: `“${q}”`, removeUrl: qs ? `/shop?${qs}` : "/shop" })
  }
  for (const brand of brands) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (q) params.set("q", q)
    brands.filter((b) => b !== brand).forEach((b) => params.append("brand", b))
    conditions.forEach((c) => params.append("condition", c))
    if (minPrice != null) params.set("min", String(minPrice))
    if (maxPrice != null) params.set("max", String(maxPrice))
    if (sort !== "newest") params.set("sort", sort)
    activeFilters.push({ key: `brand-${brand}`, label: brand, removeUrl: `/shop?${params}` })
  }
  for (const condition of conditions) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (q) params.set("q", q)
    brands.forEach((b) => params.append("brand", b))
    conditions.filter((c) => c !== condition).forEach((c) => params.append("condition", c))
    if (sort !== "newest") params.set("sort", sort)
    activeFilters.push({ key: `condition-${condition}`, label: condition, removeUrl: `/shop?${params}` })
  }
  if (minPrice != null || maxPrice != null) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (q) params.set("q", q)
    brands.forEach((b) => params.append("brand", b))
    conditions.forEach((c) => params.append("condition", c))
    if (minPrice != null && maxPrice != null) params.set("min", String(minPrice))
    if (maxPrice != null) params.set("max", String(maxPrice))
    if (sort !== "newest") params.set("sort", sort)
    const label =
      minPrice != null && maxPrice != null
        ? `Rs ${minPrice} – Rs ${maxPrice}`
        : minPrice != null
          ? `From Rs ${minPrice}`
          : `Up to Rs ${maxPrice}`
    activeFilters.push({ key: "price", label, removeUrl: `/shop?${params}` })
  }

  return (
    <>
      <PageHero
        compact
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: activeCategory ? activeCategory.name : "Shop" },
        ]}
        title={heading}
        description={blurb}
      />

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:py-10">
        {/* Sidebar filters */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4">
            <ShopFilters facets={{ categories: facets, brands: brands_, priceBounds }} />
          </div>
        </aside>

        <div className="min-w-0">
          <ShopToolbar
            total={total}
            sort={sort}
            facets={{ categories: facets, brands: brands_, priceBounds }}
          />

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Filters:</span>
              {activeFilters.map((filter) => (
                <Link
                  key={filter.key}
                  href={filter.removeUrl}
                  className="group inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand transition-all hover:border-brand/40 hover:bg-brand/15"
                >
                  {filter.label}
                  <X className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
              <Link
                href="/shop"
                className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-destructive hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}

          {products.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <PackageSearch className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">Nothing matched those filters</h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Try widening the price range or clearing a brand. Stock also moves fast — ask us
                on WhatsApp and we&apos;ll check the back room.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="outline" nativeButton={false} render={<Link href="/shop" />}>
                  Clear all filters
                </Button>
                <Button
                  variant="ghost"
                  nativeButton={false}
                  render={
                    <a
                      href={whatsappLink("Hi Dani Brothers, do you have this in stock?")}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <MessageCircle />
                  Ask on WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <InfiniteProductGrid
                initialProducts={products}
                initialPage={page}
                initialPageCount={pageCount}
                searchParams={{
                  ...(category ? { category } : {}),
                  ...(q ? { q } : {}),
                  ...(sort ? { sort } : {}),
                  ...(brands.length ? { brand: brands[0] } : {}),
                  ...(conditions.length ? { condition: conditions[0] } : {}),
                  ...(minPrice != null ? { min: String(minPrice) } : {}),
                  ...(maxPrice != null ? { max: String(maxPrice) } : {}),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Pagination({
  page,
  pageCount,
  params,
}: {
  page: number
  pageCount: number
  params: SearchParams
}) {
  function hrefFor(target: number) {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (key === "page") continue
      if (value == null) continue
      for (const v of Array.isArray(value) ? value : [value]) next.append(key, v)
    }
    if (target > 1) next.set("page", String(target))
    const qs = next.toString()
    return qs ? `/shop?${qs}` : "/shop"
  }

  // A window around the current page, so 20 pages don't render 20 buttons.
  const windowSize = 2
  const start = Math.max(1, Math.min(page - windowSize, pageCount - windowSize * 2))
  const end = Math.min(pageCount, Math.max(page + windowSize, windowSize * 2 + 1))
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
      <StepButton href={page > 1 ? hrefFor(page - 1) : null}>Previous</StepButton>

      {start > 1 && (
        <>
          <PageLink href={hrefFor(1)} label="1" />
          {start > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}

      {pages.map((n) => (
        <PageLink key={n} href={hrefFor(n)} label={String(n)} active={n === page} />
      ))}

      {end < pageCount && (
        <>
          {end < pageCount - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <PageLink href={hrefFor(pageCount)} label={String(pageCount)} />
        </>
      )}

      <StepButton href={page < pageCount ? hrefFor(page + 1) : null}>Next</StepButton>
    </nav>
  )
}

/**
 * A disabled step is a real <button disabled> (so it is properly inert and
 * announced as unavailable); an enabled step is a link, so the result stays a
 * shareable URL and works with middle-click.
 */
function StepButton({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    )
  }
  return (
    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={href} scroll />}>
      {children}
    </Button>
  )
}

function PageLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      scroll
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "grid size-8 place-items-center rounded-lg bg-primary text-sm font-medium text-primary-foreground tnum"
          : "grid size-8 place-items-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground tnum"
      }
    >
      {label}
    </Link>
  )
}
