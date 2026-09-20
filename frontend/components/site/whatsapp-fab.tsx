"use client"

import { useEffect, useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { site, whatsappLink } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * Floating WhatsApp button. Most of this shop's real orders start as a
 * WhatsApp message, so the channel stays one tap away on every page.
 *
 * It tucks itself away while the user is scrolled to the very top of short
 * pages to avoid covering content, then appears once they engage.
 */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (dismissed) return null

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-30 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-card p-1.5 shadow-lg">
        <a
          href={whatsappLink(`Hi ${site.name}, I'd like to ask about a product.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#25D366] px-3.5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Hide WhatsApp button"
          className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
