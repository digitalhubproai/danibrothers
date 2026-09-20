import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section, SectionHeading } from "@/components/site/section"
import { Stats } from "@/components/home/stats"
import { TrustStrip } from "@/components/home/trust-strip"
import { Reveal } from "@/components/motion/reveal"
import { site, whatsappLink } from "@/lib/site"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = {
  title: "About us",
  description:
    "Dani Brothers has been buying, selling and repairing computers from Hafeez Centre, Lahore since 2009.",
}

const TIMELINE = [
  {
    year: "2009",
    title: "One counter, second-hand stock",
    body: "We started buying and reselling used laptops from a single counter in Hafeez Centre. Word of mouth did the rest.",
  },
  {
    year: "2014",
    title: "Refurbishing in-house",
    body: "We brought servicing in-house — new batteries, thermal paste, storage upgrades — so a refurbished machine left the shop genuinely ready to use.",
  },
  {
    year: "2019",
    title: "Corporate supply",
    body: "Offices started buying from us in batches. We now supply and maintain fleets for a number of small firms across Lahore.",
  },
  {
    year: "Today",
    title: "Same street, wider reach",
    body: "Still at the same address, now shipping anywhere in Pakistan with cash on delivery.",
  },
]

const PROMISES = [
  {
    title: "Honest grading",
    body: "If a machine has a scuff, a tired battery or a replaced keyboard, you hear about it before you pay — not after.",
  },
  {
    title: "We buy too",
    body: "Upgrading? We take trade-ins and buy outright, working or faulty. Bring it in for a same-day valuation.",
  },
  {
    title: "Repairs that last",
    body: "Our bench handles screen replacements, storage upgrades, thermal service and board-level work on most consumer machines.",
  },
  {
    title: "No pressure",
    body: "Come in, use the machine, ask questions. We would rather sell you the right laptop than the fastest one.",
  },
]

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="container-page py-14 md:py-20">
          <p className="text-eyebrow text-brand">Since {site.since}</p>
          <h1 className="text-display mt-4 max-w-4xl text-balance">
            A computer shop that answers the phone.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {site.name} has been buying, selling and repairing machines from {site.address} for
            over a decade. No showroom gloss — just a counter, a bench, and a stock list we
            actually know.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="h-11 px-5 text-sm" nativeButton={false} render={<Link href="/shop" />}>
              Browse the shop
              <ArrowRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-5 text-sm"
              nativeButton={false}
              render={
                <a
                  href={whatsappLink(`Hi ${site.name}, I have a question.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle />
              Talk to us
            </Button>
          </div>
        </div>
      </div>

      <Section>
        <Stats />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="Built one used laptop at a time"
              className="mb-0"
            />
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Every machine we sell passes through the same bench that serviced it. That is the
              whole idea: we only sell what we would be comfortable using, because the person
              buying it is going to come back to us if something goes wrong — and we would like
              that to be a good conversation.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Prices are quoted in rupees, including tax, and they are the same whether you walk
              in or order online. No haggling required, though we won&apos;t be offended if you
              try.
            </p>
          </div>

          <ol className="relative flex flex-col gap-8 border-l border-border pl-8">
            {TIMELINE.map((entry, index) => (
              <Reveal key={entry.year} delay={index * 0.06}>
                <li className="relative">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[2.28rem] size-2.5 rounded-full border-2 border-background bg-brand"
                  />
                  <p className="text-eyebrow text-brand tnum">{entry.year}</p>
                  <h3 className="mt-1.5 text-base font-semibold">{entry.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {entry.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="What we stand behind"
          title="The short version"
          description="Four things we will not compromise on, whatever the machine costs."
        />

        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {PROMISES.map((promise) => (
            <div key={promise.title} className="bg-card p-6">
              <h3 className="text-sm font-semibold">{promise.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{promise.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <TrustStrip />
      </Section>

      <Section className="pt-0">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-primary px-6 py-12 text-primary-foreground md:px-12 md:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative max-w-2xl">
              <h2 className="text-display-sm text-balance">Come and see the stock</h2>
              <p className="mt-4 text-base leading-relaxed text-primary-foreground/80">
                Photographs only get you so far with a laptop. The shop is open {site.hours} —
                bring a USB drive and test anything you like before you buy it.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-11 px-5 text-sm"
                  nativeButton={false}
                  render={<Link href="/contact" />}
                >
                  Find the shop
                  <ArrowRight />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-11 px-5 text-sm text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  nativeButton={false}
                  render={<Link href="/contact#sell" />}
                >
                  Sell your device
                </Button>
              </div>
              <p className="mt-6 text-xs text-primary-foreground/60">
                Financing available on orders over {formatPrice(150_000)} · Trade-ins accepted
                against any purchase
              </p>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
