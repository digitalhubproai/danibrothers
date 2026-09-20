"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/lib/cart"

/**
 * The cart lives in localStorage, so the server always renders an empty cart.
 * Reading the count only after mount keeps the badge from being a hydration
 * mismatch — the alternative is a `suppressHydrationWarning` that hides real
 * bugs along with this one.
 */
export function useCartCount(): number {
  const lines = useCart((s) => s.lines)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return 0
  return lines.reduce((sum, line) => sum + line.qty, 0)
}

export function useCartHydrated(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
