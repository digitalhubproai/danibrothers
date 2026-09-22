export const site = {
  name: "Dani Brothers",
  tagline: "Computers, laptops, CCTV & accessories",
  description:
    "Buy new and certified pre-owned laptops, desktops, CCTV security cameras and computer accessories — with warranty, honest pricing and nationwide delivery across Pakistan.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+92 345 291 6412",
  phoneHref: "tel:+923452916412",
  email: "hello@danibrothers.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "923452916412",
  address: "Shop 12-A, Main Commercial Market, Gulshan-e-Maymar, Karachi",
  hours: "Mon–Sat, 11:00 AM – 9:00 PM",
  since: 2009,

  /*
   * Fill these in when the shop has the accounts. The footer renders only the
   * ones with a URL, so an unset value hides the button rather than shipping a
   * link that goes nowhere.
   */
  social: {
    // Typed as plain `string`, not the literal "", so the footer's `&&` guard
    // stays a real runtime check rather than something the compiler folds away.
    facebook: "https://facebook.com/danibrothers",
    instagram: "https://instagram.com/danibrothers",
  },
} as const

/** `to` overrides the shop number — used by the admin to message a customer. */
export function whatsappLink(message?: string, to?: string): string {
  const base = `https://wa.me/${to || site.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const CONDITIONS = ["NEW", "REFURBISHED", "USED"] as const
export type Condition = (typeof CONDITIONS)[number]

export const CONDITION_LABEL: Record<Condition, string> = {
  NEW: "Brand New",
  REFURBISHED: "Refurbished",
  USED: "Pre-Owned",
}

export const CONDITION_DESCRIPTION: Record<Condition, string> = {
  NEW: "Sealed box, full manufacturer warranty.",
  REFURBISHED: "Professionally restored, tested, 6-month shop warranty.",
  USED: "Pre-owned, inspected and graded. Sold as-is with 15-day check warranty.",
}

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

export const SHIPPING_FLAT = 350
export const FREE_SHIPPING_THRESHOLD = 50_000

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT
}
