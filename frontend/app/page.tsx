import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { TrustStrip } from "@/components/home/trust-strip"
import { Stats, BrandMarquee } from "@/components/home/stats"
import { SellDeviceCTA } from "@/components/home/sell-device-cta"
import { CctvSection } from "@/components/home/cctv-section"
import { Section, SectionHeading } from "@/components/site/section"
import { ProductGrid } from "@/components/product/product-card"
import { Reveal } from "@/components/motion/reveal"
import { getCategories, getProductsByCategorySlugs } from "@/lib/products"

// The catalogue comes from SQLite and changes whenever an admin edits a
// product, so this page is rendered per request rather than prerendered.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [categories, deals, accessories, cctv] = await Promise.all([
    getCategories(),
    getProductsByCategorySlugs(["laptops", "desktops"], 8),
    getProductsByCategorySlugs(["accessories", "keyboards-mice", "audio-webcams", "storage"], 8),
    getProductsByCategorySlugs(["security-cctv"], 8),
  ])

  return (
    <>
      <Hero />

      <Section id="categories">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by category"
          description="Nine departments, one shop counter. If you don't see what you need, ask us — stock moves fast and not everything makes it online."
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
        <Reveal>
          <ProductGrid products={deals} priorityCount={4} />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Complete your setup"
          title="Accessories"
          description="Keyboards, mice, audio gear and more to level up your workspace."
          action={{ href: "/shop?category=accessories", label: "View all accessories" }}
        />
        <Reveal>
          <ProductGrid products={accessories} priorityCount={4} />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Stay protected"
          title="CCTV & Security"
          description="Cameras and NVRs for shops, homes and offices — installed or supplied."
          action={{ href: "/shop?category=security-cctv", label: "Shop CCTV" }}
        />
        <Reveal>
          <CctvSection products={cctv} />
        </Reveal>
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
