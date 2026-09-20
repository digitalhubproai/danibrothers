import Link from "next/link"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { TrustStrip } from "@/components/home/trust-strip"
import { Stats, BrandMarquee } from "@/components/home/stats"
import { SellDeviceCTA } from "@/components/home/sell-device-cta"
import { Section, SectionHeading } from "@/components/site/section"
import { ProductGrid } from "@/components/product/product-card"
import { RecentlyViewed } from "@/components/home/recently-viewed"
import { Reveal } from "@/components/motion/reveal"
import { getCategories, getFeaturedProducts, getProductsByCategorySlugs } from "@/lib/products"

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
          eyebrow="Picked for you"
          title="Recently viewed"
          description="Items you recently checked out."
        />
        <RecentlyViewed />
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
          <SellDeviceCTA />
        </Reveal>
      </Section>
    </>
  )
}
