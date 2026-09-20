"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { ORDER_STATUSES } from "@/lib/site"
import {
  bool,
  linesToJson,
  minLength,
  num,
  pairsToJson,
  slugify,
  str,
  type ActionResult,
} from "@/lib/validation"

/**
 * Every action here re-checks the caller against the database.
 *
 * `proxy.ts` already blocks /admin, but a Server Action is a public HTTP
 * endpoint — it can be invoked without ever loading an admin page. The role
 * check has to live with the mutation, not only in front of the UI.
 */
async function guard() {
  try {
    return await requireAdmin()
  } catch {
    return null
  }
}

const DENIED: ActionResult = { ok: false, message: "You don't have permission to do that." }

function revalidateCatalogue(slug?: string) {
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/admin/products")
  if (slug) revalidatePath(`/product/${slug}`)
}

export async function saveProductAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return DENIED

  const id = str(form, "id")
  const name = str(form, "name")
  const brand = str(form, "brand")
  const description = str(form, "description")
  const categoryId = str(form, "categoryId")
  const price = num(form, "price")
  const compareAtRaw = str(form, "compareAtPrice")
  const stock = num(form, "stock")
  const conditionRaw = str(form, "condition")
  const condition = ["NEW", "REFURBISHED", "USED"].includes(conditionRaw) ? conditionRaw : "NEW"
  const featured = bool(form, "featured")
  const requestedSlug = slugify(str(form, "slug") || name)

  const fieldErrors: Record<string, string> = {}
  if (!minLength(name, 3)) fieldErrors.name = "Give the product a name."
  if (!minLength(brand, 1)) fieldErrors.brand = "Which brand is it?"
  if (!minLength(description, 20)) fieldErrors.description = "A sentence or two, at least."
  if (!categoryId) fieldErrors.categoryId = "Pick a category."
  if (!Number.isFinite(price) || price < 0) fieldErrors.price = "Enter a price in rupees."
  if (!Number.isFinite(stock) || stock < 0) fieldErrors.stock = "Stock can't be negative."
  if (!requestedSlug) fieldErrors.slug = "That name doesn't produce a usable URL."

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors }
  }

  const compareAt = compareAtRaw === "" ? null : Number(compareAtRaw)
  if (compareAt != null && (!Number.isFinite(compareAt) || compareAt < 0)) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: { compareAtPrice: "Leave it blank, or enter a price above the selling price." },
    }
  }

  const data = {
    name,
    slug: requestedSlug,
    brand,
    description,
    price: Math.round(price),
    compareAtPrice: compareAt == null ? null : Math.round(compareAt),
    stock: Math.round(stock),
    condition,
    featured,
    categoryId,
    images: linesToJson(str(form, "images")),
    specs: pairsToJson(str(form, "specs")),
  }

  // A slug is a public URL — colliding with another product would silently
  // move that product's page, so say so instead.
  const clash = await prisma.product.findFirst({
    where: { slug: requestedSlug, ...(id ? { id: { not: id } } : {}) },
    select: { name: true },
  })
  if (clash) {
    return {
      ok: false,
      message: `The URL "${requestedSlug}" is already used by ${clash.name}.`,
      fieldErrors: { slug: "Pick a different slug." },
    }
  }

  if (id) {
    await prisma.product.update({ where: { id }, data })
  } else {
    await prisma.product.create({ data })
  }

  revalidateCatalogue(requestedSlug)
  redirect("/admin/products?saved=1")
}

export async function deleteProductAction(form: FormData): Promise<void> {
  if (!(await guard())) return

  const id = str(form, "id")
  if (!id) return

  // Order history keeps its own snapshot of name/price, so removing a product
  // does not damage past orders.
  await prisma.product.delete({ where: { id } })
  revalidateCatalogue()
}

export async function toggleFeaturedAction(form: FormData): Promise<void> {
  if (!(await guard())) return
  const id = str(form, "id")
  if (!id) return

  const product = await prisma.product.findUnique({
    where: { id },
    select: { featured: true, slug: true },
  })
  if (!product) return

  await prisma.product.update({ where: { id }, data: { featured: !product.featured } })
  revalidateCatalogue(product.slug)
}

export async function updateStockAction(form: FormData): Promise<void> {
  if (!(await guard())) return
  const id = str(form, "id")
  const stock = num(form, "stock")
  if (!id || !Number.isFinite(stock) || stock < 0) return

  await prisma.product.update({ where: { id }, data: { stock: Math.round(stock) } })
  revalidateCatalogue()
}

export async function updateOrderStatusAction(form: FormData): Promise<void> {
  if (!(await guard())) return

  const id = str(form, "id")
  const status = str(form, "status")
  if (!id || !(ORDER_STATUSES as readonly string[]).includes(status)) return

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, items: { select: { productId: true, qty: true } } },
  })
  if (!order || order.status === status) return

  // Stock was taken at order time, so cancelling has to put it back — and
  // un-cancelling has to take it out again.
  const wasCancelled = order.status === "CANCELLED"
  const nowCancelled = status === "CANCELLED"
  const stockDelta = wasCancelled === nowCancelled ? 0 : nowCancelled ? 1 : -1

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status } })

    if (stockDelta !== 0) {
      for (const item of order.items) {
        if (!item.productId) continue
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: stockDelta * item.qty } },
        })
      }
    }
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
  revalidatePath("/account")
  revalidateCatalogue()
}

/** Marks a lead from the contact / sell-your-device forms as dealt with. */
export async function toggleInquiryAction(form: FormData): Promise<void> {
  if (!(await guard())) return
  const id = str(form, "id")
  if (!id) return

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: { handled: true },
  })
  if (!inquiry) return

  await prisma.inquiry.update({ where: { id }, data: { handled: !inquiry.handled } })
  revalidatePath("/admin/inquiries")
}
