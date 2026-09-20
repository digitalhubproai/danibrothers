"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition, type ReactNode } from "react"
import { X, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CONDITIONS, CONDITION_LABEL } from "@/lib/site"
import { cn } from "@/lib/utils"

export type ShopFacets = {
  categories: { name: string; slug: string; productCount: number }[]
  brands: string[]
  priceBounds: { min: number; max: number }
}

/**
 * Filters are driven entirely by the URL. That makes a filtered list
 * shareable, bookmarkable and back-button friendly — and it means the whole
 * sidebar can be a plain GET form that still works with JavaScript disabled.
 *
 * The client component only adds the convenience of applying on change
 * without a full page reload.
 */
export function ShopFilters({ facets }: { facets: ShopFacets }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = {
    category: searchParams.get("category") ?? "",
    brands: searchParams.getAll("brand"),
    conditions: searchParams.getAll("condition"),
    min: searchParams.get("min") ?? "",
    max: searchParams.get("max") ?? "",
  }

  const activeCount =
    (current.category ? 1 : 0) +
    current.brands.length +
    current.conditions.length +
    (current.min || current.max ? 1 : 0)

  const push = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      // Any filter change resets pagination — page 3 of the old result set is
      // meaningless once the result set changes.
      params.delete("page")
      startTransition(() => {
        router.push(params.toString() ? `/shop?${params}` : "/shop", { scroll: false })
      })
    },
    [router, searchParams],
  )

  function toggleMulti(key: "brand" | "condition", value: string) {
    push((params) => {
      const existing = params.getAll(key)
      params.delete(key)
      const next = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value]
      next.forEach((v) => params.append(key, v))
    })
  }

  function setSingle(key: string, value: string) {
    push((params) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
  }

  return (
    <form
      className={cn("flex flex-col gap-6", isPending && "opacity-60 transition-opacity")}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-brand text-[0.625rem] font-semibold text-brand-foreground tnum">
              {activeCount}
            </span>
          )}
        </p>
        {activeCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => startTransition(() => router.push("/shop", { scroll: false }))}
            className="text-muted-foreground"
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <FilterGroup title="Category">
        <div className="flex flex-col gap-0.5">
          <FilterRow
            label="All categories"
            checked={!current.category}
            onChange={() => setSingle("category", "")}
            type="radio"
            name="category"
          />
          {facets.categories.map((category) => (
            <FilterRow
              key={category.slug}
              label={category.name}
              count={category.productCount}
              type="radio"
              name="category"
              checked={current.category === category.slug}
              onChange={() => setSingle("category", category.slug)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Condition">
        <div className="flex flex-col gap-0.5">
          {CONDITIONS.map((condition) => (
            <FilterRow
              key={condition}
              label={CONDITION_LABEL[condition]}
              checked={current.conditions.includes(condition)}
              onChange={() => toggleMulti("condition", condition)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto pr-1">
          {facets.brands.map((brand) => (
            <FilterRow
              key={brand}
              label={brand}
              checked={current.brands.includes(brand)}
              onChange={() => toggleMulti("brand", brand)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price (Rs)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(facets.priceBounds.min)}
            defaultValue={current.min}
            aria-label="Minimum price"
            onBlur={(e) => setSingle("min", e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none tnum focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(facets.priceBounds.max)}
            defaultValue={current.max}
            aria-label="Maximum price"
            onBlur={(e) => setSingle("max", e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none tnum focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>
      </FilterGroup>
    </form>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-4 first:border-0 first:pt-0">
      <legend className="text-eyebrow mb-3 text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  )
}

function FilterRow({
  label,
  count,
  checked,
  onChange,
  type = "checkbox",
  name,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
  type?: "checkbox" | "radio"
  name?: string
}) {
  return (
    <label className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 accent-[var(--brand)]"
      />
      <span className="flex-1 truncate">{label}</span>
      {count != null && (
        <span className="text-xs text-muted-foreground tnum">{count}</span>
      )}
    </label>
  )
}
