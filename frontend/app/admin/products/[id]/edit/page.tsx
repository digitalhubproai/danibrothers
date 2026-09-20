import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import { prisma } from "@/lib/db"
import { jsonToLines, jsonToPairs } from "@/lib/validation"

export const metadata: Metadata = { title: "Edit product" }

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ])

  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{product.name}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Editing <span className="font-mono text-xs">/product/{product.slug}</span>
        </p>
      </div>

      <ProductForm
        categories={categories}
        values={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          description: product.description,
          categoryId: product.categoryId,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice == null ? "" : String(product.compareAtPrice),
          stock: String(product.stock),
          condition: product.condition,
          featured: product.featured,
          images: jsonToLines(product.images),
          specs: jsonToPairs(product.specs),
        }}
      />
    </div>
  )
}
