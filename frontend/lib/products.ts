import type { Category, Prisma, Product } from "@prisma/client"
import { prisma } from "@/lib/db"
import type { SortKey } from "@/lib/sort-options"
import type { Spec, ProductView } from "@/lib/product-types"

// Re-exported for server-side callers. Client components must import these
// from `@/lib/sort-options` directly — see the note in that file.
export { SORT_OPTIONS, type SortKey } from "@/lib/sort-options"

export type { Spec, ProductView } from "@/lib/product-types"
export { stockState } from "@/lib/product-types"

/**
 * `images` and `specs` are JSON strings in SQLite (no JSON column type). A
 * malformed value should degrade to an empty list rather than crash a page,
 * so parsing is defensive.
 */
function parseArray<T>(raw: string): T[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

type ProductRow = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null
}

export function toProductView(row: ProductRow): ProductView {
  const images = parseArray<string>(row.images).filter(
    (src): src is string => typeof src === "string" && src.length > 0,
  )
  return {
    ...row,
    images,
    specs: parseArray<Spec>(row.specs).filter(
      (s): s is Spec => !!s && typeof s.label === "string" && typeof s.value === "string",
    ),
    category: row.category ?? null,
    primaryImage: images[0] ?? null,
  }
}

const withCategory = { category: { select: { id: true, name: true, slug: true } } } as const

export type ProductFilters = {
  category?: string
  brands?: string[]
  conditions?: string[]
  minPrice?: number
  maxPrice?: number
  q?: string
  sort?: SortKey
  featuredOnly?: boolean
  page?: number
  perPage?: number
}

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {}

  if (filters.category) where.category = { slug: filters.category }
  if (filters.brands?.length) where.brand = { in: filters.brands }
  if (filters.conditions?.length) where.condition = { in: filters.conditions }
  if (filters.featuredOnly) where.featured = true

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    }
  }

  // SQLite's `contains` is case-insensitive for ASCII by default, which is
  // what we want for brand/model searches here.
  if (filters.q?.trim()) {
    const q = filters.q.trim()
    where.OR = [{ name: { contains: q } }, { brand: { contains: q } }, { description: { contains: q } }]
  }

  return where
}

function buildOrderBy(sort: SortKey = "newest"): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }]
    case "price-desc":
      return [{ price: "desc" }]
    case "name":
      return [{ name: "asc" }]
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }]
  }
}

export async function getProducts(filters: ProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const perPage = filters.perPage ?? 12
  const where = buildWhere(filters)

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: withCategory,
      orderBy: buildOrderBy(filters.sort),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products: rows.map(toProductView),
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  }
}

export async function getFeaturedProducts(take = 8): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    include: withCategory,
    orderBy: { createdAt: "desc" },
    take,
  })
  return rows.map(toProductView)
}

export async function getProductsByCategorySlugs(
  categorySlugs: string[],
  take = 8,
): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    where: {
      category: { slug: { in: categorySlugs } },
    },
    include: withCategory,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
  })
  return rows.map(toProductView)
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  const row = await prisma.product.findUnique({ where: { slug }, include: withCategory })
  return row ? toProductView(row) : null
}

export async function getRelatedProducts(
  product: Pick<ProductView, "id" | "categoryId">,
  take = 4,
): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: withCategory,
    orderBy: { featured: "desc" },
    take,
  })
  return rows.map(toProductView)
}

export async function getCategories(): Promise<(Category & { productCount: number })[]> {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  })
  return rows.map(({ _count, ...category }) => ({ ...category, productCount: _count.products }))
}

export async function getBrands(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    distinct: ["brand"],
    select: { brand: true },
    orderBy: { brand: "asc" },
  })
  return rows.map((r) => r.brand)
}

export async function getPriceBounds(): Promise<{ min: number; max: number }> {
  const result = await prisma.product.aggregate({ _min: { price: true }, _max: { price: true } })
  return { min: result._min.price ?? 0, max: result._max.price ?? 0 }
}

export async function getProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { slug: true } })
  return rows.map((r) => r.slug)
}
