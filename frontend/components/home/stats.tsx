"use client"

import { CountUp } from "@/components/motion/count-up"
import { Marquee } from "@/components/motion/marquee"
import { site } from "@/lib/site"

const STATS = [
  { value: 2400, suffix: "+", label: "Machines sold" },
  { value: 16, suffix: "+", label: "Years in the trade" },
  { value: 40, suffix: "+", label: "Brands stocked" },
  { value: 98, suffix: "%", label: "Would buy again" },
]

const BRANDS = [
  "Dell",
  "HP",
  "Lenovo",
  "Apple",
  "Asus",
  "Acer",
  "MSI",
  "Samsung",
  "Logitech",
  "Kingston",
  "Corsair",
  "AMD",
  "Intel",
  "TP-Link",
  "Anker",
  "UGREEN",
  "Hikvision",
  "Dahua",
]

export function Stats() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="bg-card px-5 py-8 text-center transition-colors duration-300 hover:bg-brand-subtle/40"
        >
          <p className="text-3xl font-semibold tracking-tight text-foreground tnum sm:text-4xl">
            <CountUp value={stat.value} suffix={stat.suffix} />
          </p>
          <p className="mt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}

export function BrandMarquee() {
  return (
    <div className="border-y border-border bg-card py-8">
      <p className="container-page text-eyebrow mb-6 text-muted-foreground">
        Brands we stock and service
      </p>
      <Marquee>
        {BRANDS.map((brand) => (
          <span
            key={brand}
            className="mx-6 text-xl font-semibold tracking-tight text-muted-foreground/60 transition-colors duration-300 hover:text-foreground sm:mx-8 sm:text-2xl"
          >
            {brand}
          </span>
        ))}
      </Marquee>
      <p className="container-page mt-6 text-xs text-muted-foreground">
        Walk into {site.name} — {site.address}
      </p>
    </div>
  )
}
