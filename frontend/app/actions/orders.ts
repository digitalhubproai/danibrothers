"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { orderNumberFromId } from "@/lib/format"
import { shippingFor } from "@/lib/site"
import { isEmail, isPhone, minLength, str, type ActionResult } from "@/lib/validation"

type CartInput = { productId: string; qty: number }

/**
 * The client sends product ids and quantities — never prices. Every figure on
 * the order is read back from the database, so a tampered cart cannot buy a
 * laptop for one rupee.
 */
function parseCart(raw: string): CartInput[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null
        const { productId, qty } = entry as { productId?: unknown; qty?: unknown }
        if (typeof productId !== "string") return null
        const quantity = Math.floor(Number(qty))
        if (!Number.isFinite(quantity) || quantity < 1) return null
        return { productId, qty: Math.min(quantity, 99) }
      })
      .filter((v): v is CartInput => v !== null)
  } catch {
    return []
  }
}

export async function placeOrderAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const cart = parseCart(str(form, "cart"))
  if (cart.length === 0) {
    return { ok: false, message: "Your cart is empty." }
  }

  const customerName = str(form, "customerName")
  const phone = str(form, "phone")
  const email = str(form, "email")
  const address = str(form, "address")
  const city = str(form, "city")
  const notes = str(form, "notes")
  const paymentMethod = str(form, "paymentMethod") === "BANK_TRANSFER" ? "BANK_TRANSFER" : "COD"

  const fieldErrors: Record<string, string> = {}
  if (!minLength(customerName, 2)) fieldErrors.customerName = "Who should we ask for?"
  if (!isPhone(phone)) fieldErrors.phone = "Enter a valid Pakistani mobile number."
  if (email && !isEmail(email)) fieldErrors.email = "That email address doesn't look right."
  if (!minLength(address, 8)) fieldErrors.address = "Add a street address the courier can find."
  if (!minLength(city, 2)) fieldErrors.city = "Which city?"

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: cart.map((c) => c.productId) } },
  })
  const byId = new Map(products.map((p) => [p.id, p]))

  const lines: {
    productId: string
    name: string
    slug: string
    image: string | null
    price: number
    qty: number
  }[] = []

  for (const item of cart) {
    const product = byId.get(item.productId)
    if (!product) {
      return { ok: false, message: "Something in your cart is no longer listed. Please review it." }
    }
    if (product.stock < item.qty) {
      return {
        ok: false,
        message: `Only ${product.stock} of ${product.name} left — please adjust the quantity.`,
      }
    }

    let image: string | null = null
    try {
      const parsed: unknown = JSON.parse(product.images)
      if (Array.isArray(parsed) && typeof parsed[0] === "string") image = parsed[0]
    } catch {
      image = null
    }

    lines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image,
      price: product.price,
      qty: item.qty,
    })
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  const shipping = shippingFor(subtotal)
  const total = subtotal + shipping

  const user = await getCurrentUser()

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        // Placeholder; replaced below with an id-derived number so it is
        // always unique without a separate counter table.
        orderNumber: `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: user?.id ?? null,
        customerName,
        phone,
        email: email || null,
        address,
        city,
        notes: notes || null,
        paymentMethod,
        subtotal,
        shipping,
        total,
        status: "PENDING",
        items: { create: lines },
      },
    })

    // Stock leaves at order time; cancelling puts it back (see the admin
    // actions). The availability check above ran outside this transaction, so
    // a second checkout could have passed it in the meantime. Guarding the
    // decrement itself — and rolling the whole order back if nothing matched —
    // is what actually stops two buyers from taking the last laptop.
    for (const line of lines) {
      const { count } = await tx.product.updateMany({
        where: { id: line.productId, stock: { gte: line.qty } },
        data: { stock: { decrement: line.qty } },
      })
      if (count === 0) throw new OutOfStockError(line.name)
    }

    return tx.order.update({
      where: { id: created.id },
      data: { orderNumber: orderNumberFromId(created.id) },
    })
  }).catch((error: unknown) => {
    if (error instanceof OutOfStockError) return null
    throw error
  })

  if (!order) {
    return {
      ok: false,
      message: "Someone bought the last one while you were checking out. Please review your cart.",
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  redirect(`/order/${order.id}`)
}

/** Thrown inside the transaction to roll the order back and surface a message. */
class OutOfStockError extends Error {
  constructor(productName: string) {
    super(`${productName} sold out during checkout`)
    this.name = "OutOfStockError"
  }
}
