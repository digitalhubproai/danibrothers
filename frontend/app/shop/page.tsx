import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { PackageSearch } from "lucide-react"
import { ShopFilters } from "@/components/product/shop-filters"
import { ProductGrid } from "@/components/product/product-card"
import { ShopToolbar } from "@/components/product/shop-toolbar"
import { Button } from "@/components/ui/button"
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
    "Browse new, refurbished and pre-owned laptops, desktops, monitors and accessories at Dani Brothers.",
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
      : "Everything currently on the shelves — new, refurbished and pre-owned."

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="container-page py-8 md:py-10">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">{activeCategory ? activeCategory.name : "Shop"}</span>
          </nav>
          <h1 className="text-display-sm">{heading}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{blurb}</p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:py-10">
        {/* Below lg the same filters live in a sheet, opened from the toolbar. */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <ShopFilters facets={{ categories: facets, brands: brands_, priceBounds }} />
        </aside>

        <div className="min-w-0">
          <ShopToolbar
            total={total}
            sort={sort}
            facets={{ categories: facets, brands: brands_, priceBounds }}
          />

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
              <Button className="mt-6" variant="outline" nativeButton={false} render={<Link href="/shop" />}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <ProductGrid products={products} priorityCount={4} />
              </div>
              {pageCount > 1 && (
                <Pagination page={page} pageCount={pageCount} params={sp} />
              )}
            </>
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
