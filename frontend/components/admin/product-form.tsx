"use client"

import { useActionState, type ComponentProps } from "react"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveProductAction } from "@/app/actions/admin"
import { CONDITIONS, CONDITION_LABEL } from "@/lib/site"
import { cn } from "@/lib/utils"
import type { ActionResult } from "@/lib/validation"

export type ProductFormValues = {
  id?: string
  name: string
  slug: string
  brand: string
  description: string
  categoryId: string
  price: string
  compareAtPrice: string
  stock: string
  condition: string
  featured: boolean
  /** One URL per line — the textarea is the simplest editable list. */
  images: string
  /** `Label: value` per line. */
  specs: string
}

export function ProductForm({
  values,
  categories,
}: {
  values: ProductFormValues
  categories: { id: string; name: string }[]
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveProductAction,
    null,
  )

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}
  const isEdit = Boolean(values.id)

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {state && !state.ok && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive-subtle px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Product name"
            name="name"
            defaultValue={values.name}
            placeholder="Dell Latitude 5420 — i5 11th Gen"
            error={errors.name}
            className="sm:col-span-2"
            required
          />
          <Field
            label="Brand"
            name="brand"
            defaultValue={values.brand}
            placeholder="Dell"
            error={errors.brand}
            required
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={values.categoryId}
              aria-invalid={!!errors.categoryId}
              className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              required
            >
              <option value="">Choose a category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={values.description}
              placeholder="What it is, who it suits, and anything a buyer should know before ordering."
              aria-invalid={!!errors.description}
              required
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Pricing &amp; stock</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field
            label="Price (Rs)"
            name="price"
            type="number"
            min={0}
            defaultValue={values.price}
            error={errors.price}
            required
          />
          <Field
            label="Compare-at (Rs)"
            name="compareAtPrice"
            type="number"
            min={0}
            defaultValue={values.compareAtPrice}
            placeholder="Optional"
            error={errors.compareAtPrice}
          />
          <Field
            label="Stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={values.stock}
            error={errors.stock}
            required
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              name="condition"
              defaultValue={values.condition}
              className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {CONDITION_LABEL[condition]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 self-end pb-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={values.featured}
              className="size-4 accent-[var(--brand)]"
            />
            Feature on the home page
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Media &amp; specs</h2>

        <div className="mt-4 grid gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="images">Image URLs</Label>
            <Textarea
              id="images"
              name="images"
              rows={4}
              defaultValue={values.images}
              placeholder={"https://images.unsplash.com/photo-…\nhttps://…"}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              One URL per line. The first image is the one shown on cards and in search results.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="specs">Specifications</Label>
            <Textarea
              id="specs"
              name="specs"
              rows={6}
              defaultValue={values.specs}
              placeholder={"Processor: Core i5-1145G7\nRAM: 16GB DDR4\nStorage: 512GB NVMe SSD"}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              One per line, as <span className="font-mono">Label: value</span>.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={values.slug}
              placeholder="dell-latitude-5420-i5"
              aria-invalid={!!errors.slug}
              className="font-mono text-xs"
            />
            <p className={cn("text-xs", errors.slug ? "text-destructive" : "text-muted-foreground")}>
              {errors.slug ?? "Leave blank to build it from the product name."}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" className="h-10 px-5 text-sm" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="ghost" nativeButton={false} render={<Link href="/admin/products" />}>
          Cancel
        </Button>
        {isEdit && values.slug && (
          <Link
            href={`/product/${values.slug}`}
            className="ml-auto text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            View on storefront →
          </Link>
        )}
      </div>
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
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-invalid={!!error} className="h-9" {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
