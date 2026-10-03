"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ApiError, api, toActionResult } from "@/lib/api"
import { sessionToken } from "@/lib/auth"
import { str, type ActionResult } from "@/lib/validation"

type CartInput = { productId: string; qty: number }

/**
 * The client sends product ids and quantities — never prices. Every figure on
 * the order is read back from the database by the API, so a tampered cart
 * cannot buy a laptop for one rupee.
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
  // Checkout is signed-in only: no session means the login page, with a
  // promise to come straight back here once they're in.
  const token = await sessionToken()
  if (!token) redirect("/login?next=%2Fcheckout")

  const cart = parseCart(str(form, "cart"))
  if (cart.length === 0) {
    return { ok: false, message: "Your cart is empty." }
  }

  const payload = {
    cart,
    customerName: str(form, "customerName"),
    phone: str(form, "phone"),
    email: str(form, "email") || null,
    address: str(form, "address"),
    city: str(form, "city"),
    notes: str(form, "notes") || null,
    paymentMethod: str(form, "paymentMethod") === "BANK_TRANSFER" ? "BANK_TRANSFER" : "COD",
  }

  let orderId: string
  try {
    const order = await api.post<{ id: string }>("/api/orders", payload, token)
    orderId = order.id
  } catch (error) {
    // Cookie present but rejected (expired/rotated secret) — same destination
    // as having no cookie at all.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?next=%2Fcheckout")
    }
    return toActionResult(error)
  }

  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  redirect(`/order/${orderId}`)
}
