import type { Metadata } from "next"
import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section, SectionHeading } from "@/components/site/section"
import { InquiryForm } from "@/components/contact/inquiry-form"
import { site, whatsappLink } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact",
  description: `Visit ${site.name} at ${site.address}, call ${site.phone}, or send us a message — including valuations for your old laptop.`,
}

const MAP_QUERY = encodeURIComponent(site.address)

export default function ContactPage() {
  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="container-page py-14 md:py-16">
          <p className="text-eyebrow text-brand">Get in touch</p>
          <h1 className="text-display mt-4 max-w-3xl text-balance">
            Ask us anything — or bring it in.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Stock questions, repairs, trade-ins, bulk orders for an office. The fastest route is
            WhatsApp; the most reliable is walking through the door.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-11 px-5 text-sm"
              nativeButton={false}
              render={
                <a
                  href={whatsappLink(`Hi ${site.name}, I'd like to ask about…`)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle />
              WhatsApp us
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-5 text-sm"
              nativeButton={false}
              render={<a href={site.phoneHref} />}
            >
              <Phone />
              {site.phone}
            </Button>
          </div>
        </div>
      </div>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              <InfoCard icon={MapPin} title="Visit the shop">
                {site.address}
              </InfoCard>
              <InfoCard icon={Clock} title="Opening hours">
                {site.hours}
                <br />
                Closed on Sundays
              </InfoCard>
              <InfoCard icon={Phone} title="Call or WhatsApp">
                <a href={site.phoneHref} className="hover:underline">
                  {site.phone}
                </a>
              </InfoCard>
              <InfoCard icon={Mail} title="Email">
                <a href={`mailto:${site.email}`} className="hover:underline">
                  {site.email}
                </a>
              </InfoCard>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title={`Map showing ${site.name}`}
                src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0 grayscale-[0.35]"
              />
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Parking is tight on the main boulevard — the side street behind the centre usually
              has space. We&apos;re on the first floor, second counter on the left.
            </p>
          </div>

          <div id="sell" className="scroll-mt-28">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <SectionHeading
                eyebrow="Sell or ask"
                title="Tell us what you have"
                description="Selling an old machine, or need a recommendation? Send the details and we'll come back with a figure or an answer — usually the same day."
                className="mb-6"
              />
              <InquiryForm />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Prefer to talk it through? Walk in with the machine and we&apos;ll value it on the
              spot. No appointment needed during {site.hours}. Read more{" "}
              <Link href="/about" className="font-medium text-brand underline-offset-4 hover:underline">
                about how we work
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: ReactNode
}) {
  return (
    <div className="bg-card p-5">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-subtle text-brand">
        <Icon className="size-4" />
      </span>
      <h2 className="mt-3 text-sm font-semibold">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}
