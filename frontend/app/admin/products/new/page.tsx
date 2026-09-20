import type { Metadata } from "next"
import { ProductForm } from "@/components/admin/product-form"
import { prisma } from "@/lib/db"

export const metadata: Metadata = { title: "New product" }

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New product</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          It goes live on the storefront as soon as you save it.
        </p>
      </div>

      <ProductForm
        categories={categories}
        values={{
          name: "",
          slug: "",
          brand: "",
          description: "",
          categoryId: "",
          price: "",
          compareAtPrice: "",
          stock: "1",
          condition: "NEW",
          featured: false,
          images: "",
          specs: "",
        }}
      />
    </div>
  )
}
