import { NextResponse } from "next/server"
import { getProducts } from "@/lib/products"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const category = searchParams.get("category")?.trim() || undefined
  const q = searchParams.get("q")?.trim() || undefined
  const sort = (searchParams.get("sort")?.trim() || "newest") as any
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const brands = searchParams.getAll("brand").filter(Boolean)
  const conditions = searchParams.getAll("condition").filter(Boolean)
  const minPrice = searchParams.get("min") ? Number(searchParams.get("min")) : undefined
  const maxPrice = searchParams.get("max") ? Number(searchParams.get("max")) : undefined

  const result = await getProducts({
    category,
    brands,
    conditions,
    minPrice,
    maxPrice,
    q,
    sort,
    page,
    perPage: 12,
  })

  return NextResponse.json(result)
}
