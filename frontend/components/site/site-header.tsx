"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  User,
  Phone,
  Truck,
  Laptop,
  Monitor,
  Keyboard,
  Headphones,
  HardDrive,
  Cpu,
  Cable,
  PcCase,
  X,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/site/logo"
import { useCartCount } from "@/components/site/use-cart-count"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/utils"
import { site, whatsappLink, FREE_SHIPPING_THRESHOLD } from "@/lib/site"
import { formatPrice } from "@/lib/format"
import type { SessionUser } from "@/lib/auth"

type NavCategory = { name: string; slug: string }

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  laptops: <Laptop className="size-4" />,
  desktops: <Monitor className="size-4" />,
  monitors: <Monitor className="size-4" />,
  "keyboards-mice": <Keyboard className="size-4" />,
  storage: <HardDrive className="size-4" />,
  components: <Cpu className="size-4" />,
  "audio-webcams": <Headphones className="size-4" />,
  accessories: <Cable className="size-4" />,
}

const STATIC_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader({
  categories,
  user,
}: {
  categories: NavCategory[]
  user: SessionUser | null
}) {
  const pathname = usePathname()
  const cartCount = useCartCount()
  const openCart = useCart((s) => s.open)

  const [scrolled, setScrolled] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [shopMounted, setShopMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const shopRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setShopOpen(false)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShopOpen(false)
    const onClick = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false)
    }
    if (shopMounted) {
      document.addEventListener("keydown", onKey)
      document.addEventListener("mousedown", onClick)
    }
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [shopMounted])

  useEffect(() => {
    if (shopOpen) {
      setShopMounted(true)
    } else {
      const timer = setTimeout(() => setShopMounted(false), 200)
      return () => clearTimeout(timer)
    }
  }, [shopOpen])

  return (
    <>
      <AnnouncementBar />

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-500",
          scrolled
            ? "border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgb(0,0,0,0.08)]"
            : "border-transparent bg-background/95 backdrop-blur-md",
        )}
      >
        <div className="container-page flex h-16 items-center gap-4">
          <Logo />

          {/* Desktop nav */}
          <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
            <div className="relative" ref={shopRef}>
              <button
                type="button"
                onClick={() => setShopOpen((v) => !v)}
                aria-expanded={shopOpen}
                aria-haspopup="true"
                className={cn(
                  "relative inline-flex h-9 items-center gap-1.5 px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  "after:absolute after:bottom-1.5 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-brand after:transition-all after:duration-300",
                  shopOpen && "text-foreground after:w-4/5",
                  pathname.startsWith("/shop") && "text-foreground after:w-4/5",
                )}
              >
                <Package className="size-4" />
                Shop
                <ChevronDown
                  className={cn("size-3.5 transition-transform duration-300", shopOpen && "rotate-180")}
                />
              </button>

              {shopMounted && (
                <div
                  className={cn(
                    "absolute left-0 top-full z-50 mt-2 w-[34rem] rounded-2xl border border-border/60 bg-popover p-3 shadow-[0_24px_48px_-16px_rgb(0,0,0/0.12)] transition-all duration-300 ease-out",
                    shopOpen
                      ? "pointer-events-auto opacity-100 blur-none translate-y-0"
                      : "pointer-events-none opacity-0 blur-[4px] -translate-y-1",
                  )}
                >
                  <div className="grid grid-cols-2 gap-1.5">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/shop?category=${category.slug}`}
                        className="group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 hover:bg-accent"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-all duration-300 group-hover:bg-brand/10 group-hover:text-brand group-hover:scale-105">
                          {CATEGORY_ICONS[category.slug] ?? <ChevronDown className="size-4" />}
                        </span>
                        <span className="transition-colors group-hover:text-foreground">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2.5 border-t border-border/50 pt-2.5">
                    <Link
                      href="/shop"
                      className="group flex items-center justify-center gap-2 rounded-xl bg-brand/5 px-3 py-2.5 text-sm font-semibold text-brand transition-all duration-300 hover:bg-brand hover:text-white"
                    >
                      Browse everything
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {STATIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  "after:absolute after:bottom-1.5 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-brand after:transition-all after:duration-300",
                  pathname === link.href && "text-brand after:w-4/5",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <SearchForm query={query} setQuery={setQuery} className="hidden md:flex" />

            {/* Phone CTA */}
            <a
              href={site.phoneHref}
              className="hidden h-9 items-center gap-2 rounded-lg bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-600 transition-all duration-300 hover:bg-emerald-500/20 hover:shadow-sm md:inline-flex"
            >
              <Phone className="size-3.5" />
              <span className="hidden xl:inline">{site.phone}</span>
            </a>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              nativeButton={false}
              render={
                <Link href={user ? "/account" : "/login"} aria-label={user ? "Your account" : "Sign in"} />
              }
            >
              <User />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              className="relative"
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
            >
              <ShoppingBag />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-[1.125rem] place-items-center rounded-full bg-brand px-1 py-0.5 text-[0.625rem] font-bold leading-4 text-white tnum shadow-lg shadow-brand/25">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="lg:hidden" />}
                aria-label="Open menu"
              >
                <Menu />
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm gap-0 p-0">
                <div className="flex items-center justify-between border-b border-border/50 p-4">
                  <SheetTitle>Menu</SheetTitle>
                  <a
                    href={whatsappLink("Hi Dani Brothers, I have a question.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20"
                  >
                    <Phone className="size-3.5" />
                    WhatsApp
                  </a>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <SearchForm query={query} setQuery={setQuery} className="mb-5 md:hidden" />

                  <p className="mb-3 text-[0.65rem] font-bold tracking-[0.14em] text-muted-foreground/60 uppercase">
                    Shop by category
                  </p>
                  <div className="mb-5 flex flex-col gap-1">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/shop?category=${category.slug}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                          {CATEGORY_ICONS[category.slug] ?? <ChevronDown className="size-3.5" />}
                        </span>
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border/50 pt-3">
                    {STATIC_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                          pathname === link.href && "text-brand",
                        )}
                      >
                        <span className="w-4.5 text-center">
                          {link.label === "All Products" ? (
                            <Search className="size-3.5" />
                          ) : link.label === "About" ? (
                            <span>🌐</span>
                          ) : (
                            <Phone className="size-3.5" />
                          )}
                        </span>
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      href={user ? "/account" : "/login"}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <User className="size-3.5 shrink-0 text-muted-foreground/60" />
                      {user ? "My account" : "Sign in"}
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}

function SearchForm({
  query,
  setQuery,
  className,
}: {
  query: string
  setQuery: (value: string) => void
  className?: string
}) {
  const [focused, setFocused] = useState(false)

  return (
    <form
      action="/shop"
      className={cn("relative items-center", className)}
      role="search"
      onSubmit={() => setQuery("")}
    >
      <div
        className={cn(
          "relative flex items-center rounded-xl border transition-all duration-300",
          focused
            ? "border-brand/40 ring-3 ring-brand/10 bg-card shadow-sm"
            : "border-border bg-muted/40 hover:bg-muted/60",
        )}
      >
        <Search className="pointer-events-none ml-3 size-4 text-muted-foreground/60" />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search products…"
          aria-label="Search products"
          className="h-9 w-48 bg-transparent pl-2.5 pr-3 text-sm outline-none placeholder:text-muted-foreground xl:w-64"
        />
      </div>
    </form>
  )
}

function AnnouncementBar() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      {/* Subtle shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

      <div className="container-page relative flex h-9 items-center justify-center gap-2.5 text-xs font-medium">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-400">
          <Truck className="size-3" />
          FREE DELIVERY
        </span>
        <span className="text-white/50">on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
        <span className="hidden text-white/20 sm:inline">·</span>
        <a
          href={site.phoneHref}
          className="hidden items-center gap-1.5 text-white/50 transition-colors hover:text-white sm:inline-flex"
        >
          <Phone className="size-3" />
          {site.phone}
        </a>
      </div>
    </div>
  )
}
