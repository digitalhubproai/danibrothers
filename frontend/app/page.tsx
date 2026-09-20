import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { TrustStrip } from "@/components/home/trust-strip"
import { Stats, BrandMarquee } from "@/components/home/stats"
import { Section, SectionHeading } from "@/components/site/section"
import { ProductGrid } from "@/components/product/product-card"
import { Reveal } from "@/components/motion/reveal"
import { getCategories, getFeaturedProducts, getProductsByCategorySlugs } from "@/lib/products"
import { site, whatsappLink, FREE_SHIPPING_THRESHOLD } from "@/lib/site"
import { formatPrice } from "@/lib/format"

// The catalogue comes from SQLite and changes whenever an admin edits a
// product, so this page is rendered per request rather than prerendered.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [categories, featured, deals, accessories] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProductsByCategorySlugs(["laptops", "desktops"], 8),
    getProductsByCategorySlugs(["accessories", "keyboards-mice", "audio-webcams", "storage"], 8),
  ])

  const highlight = featured[0] ?? null

  return (
    <>
      <Hero highlight={highlight} />

      <Section>
        <SectionHeading
          eyebrow="Browse"
          title="Shop by category"
          description="Eight departments, one shop counter. If you don't see what you need, ask us — stock moves fast and not everything makes it online."
          action={{ href: "/shop", label: "View all products" }}
        />
        <CategoryGrid categories={categories} />
      </Section>

      <BrandMarquee />

      <Section>
        <SectionHeading
          eyebrow="Hot right now"
          title="Today's Deals"
          description="Best value laptops and desktops, handpicked every week."
          action={{ href: "/shop?category=laptops", label: "Browse all" }}
        />
        <ProductGrid products={deals} priorityCount={4} />
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Complete your setup"
          title="Accessories"
          description="Keyboards, mice, audio gear and more to level up your workspace."
          action={{ href: "/shop?category=accessories", label: "View all accessories" }}
        />
        <ProductGrid products={accessories} priorityCount={4} />
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Why buy from us"
          title="A shop you can come back to"
          description="We have been on the same street since 2009. That only works if the machines are right and the pricing is honest."
        />
        <TrustStrip />
      </Section>

      <Section className="pt-0">
        <Stats />
      </Section>

      <Section className="pt-0">
        <Reveal>
          <div className="group relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-14 text-white md:px-14 md:py-20 shadow-2xl shadow-black/40">
            {/* Blurred background image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105"
              style={{
                backgroundImage: "url('/images/pc with laptop.png')",
                filter: "blur(20px) brightness(0.3) saturate(1.2)",
                transform: "scale(1.2)",
              }}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 via-zinc-900/70 to-zinc-950/90" />

            {/* Glow orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-brand/8 blur-[120px] transition-all duration-1000 group-hover:bg-brand/15 group-hover:scale-125" />
            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />

            {/* Grid lines */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Border glow */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-16">
              {/* Left content */}
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Same day valuation
                </div>

                <h2 className="mt-5 text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.1] tracking-tight text-balance">
                  <span className="text-white">Sell your old device</span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                    for a fair price
                  </span>
                </h2>

                <p className="mt-5 text-sm leading-relaxed text-white/45 max-w-md">
                  Bring it in or send photos on WhatsApp. We buy laptops, desktops and components, working or not.
                </p>

                {/* Trust points */}
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {["Same day cash", "No obligation", "Any condition"].map((item) => (
                    <span key={item} className="flex items-center gap-2 text-xs text-white/40">
                      <svg className="size-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right side — CTA cards */}
              <div className="mt-10 lg:mt-0 flex flex-col sm:flex-row gap-4">
                {/* WhatsApp card */}
                <a
                  href={whatsappLink("Hi Dani Brothers, I want to sell my laptop.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/card relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-500 hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 transition-all duration-500 group-hover/card:scale-110 group-hover/card:bg-emerald-500/25">
                    <MessageCircle className="size-6" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">WhatsApp a photo</p>
                    <p className="text-xs text-white/40 mt-0.5">Get a ballpark in minutes</p>
                  </div>
                  <ArrowRight className="ml-auto size-4 text-white/30 transition-all duration-300 group-hover/card:translate-x-1 group-hover/card:text-emerald-400" />
                </a>

                {/* Form card */}
                <Link
                  href="/contact#sell"
                  className="group/card relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-500 hover:border-brand/30 hover:bg-brand/[0.06] hover:shadow-lg hover:shadow-brand/10"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-brand/15 text-blue-400 transition-all duration-500 group-hover/card:scale-110 group-hover/card:bg-brand/25">
                    <ArrowRight className="size-6" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">Fill the form</p>
                    <p className="text-xs text-white/40 mt-0.5">Detailed valuation</p>
                  </div>
                  <ArrowRight className="ml-auto size-4 text-white/30 transition-all duration-300 group-hover/card:translate-x-1 group-hover/card:text-blue-400" />
                </Link>
              </div>
            </div>

            {/* Bottom address */}
            <div className="relative mt-8 pt-6 border-t border-white/5">
              <p className="text-xs text-white/30">
                Free delivery on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)} · Visit us at{" "}
                {site.address}
              </p>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
