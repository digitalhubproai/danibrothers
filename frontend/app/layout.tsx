import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { CartDrawer } from "@/components/site/cart-drawer"
import { ScrollToTop } from "@/components/site/scroll-to-top"
import { ServiceWorkerRegistration } from "@/components/site/sw-registration"
import { WhatsAppFab } from "@/components/site/whatsapp-fab"
import { site } from "@/lib/site"
import { getCategories } from "@/lib/products"
import { getSession } from "@/lib/auth"
import "./globals.css"

// `--font-sans` is what app/globals.css maps into Tailwind's font-sans token,
// so the variable name has to match the theme block there.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "laptops Pakistan",
    "computer shop Lahore",
    "used laptops",
    "refurbished laptops",
    "computer accessories",
    "Dani Brothers",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  themeColor: "#1d4ed8",
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The header shows the category menu and the signed-in state, so both are
  // resolved here rather than fetched again by each page.
  const [categories, user] = await Promise.all([getCategories(), getSession()])
  const navCategories = categories.map((c) => ({ name: c.name, slug: c.slug }))

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ServiceWorkerRegistration />
          <SiteHeader categories={navCategories} user={user} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <ScrollToTop />
          <WhatsAppFab />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
