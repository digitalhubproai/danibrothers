"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MessageCircle, Sparkles, Zap, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { site, whatsappLink } from "@/lib/site"
import { motion, AnimatePresence } from "motion/react"
import { useEffect, useState, useCallback } from "react"
import type { ProductView } from "@/lib/product-types"

const SLIDES = [
  {
    id: "laptops",
    num: "01",
    label: "Laptops",
    image: "/images/pc with laptop.png",
    badge: { icon: <Sparkles className="size-3.5" />, text: "Fresh Stock" },
    headline: "Laptops You Can Trust at Prices That Make Sense",
    highlight: "Prices That Make Sense",
    subhead: "Every machine tested and warranted. Buy in store or delivered anywhere in Pakistan.",
    ctaPrimary: { label: "Browse laptops", href: "/shop" },
    ctaSecondary: {
      label: "WhatsApp us",
      href: whatsappLink("Hi, I'm looking for a laptop."),
      icon: <MessageCircle className="size-4" />,
    },
  },
  {
    id: "computers",
    num: "02",
    label: "Computers",
    image: "/images/cmputers.png",
    badge: { icon: <Zap className="size-3.5" />, text: "Power Builds" },
    headline: "Desktops Monitors and Gear for Every Setup",
    highlight: "Every Setup",
    subhead: "From budget builds to pro rigs, we have got the parts and the know-how.",
    ctaPrimary: { label: "Shop computers", href: "/shop?category=desktops" },
    ctaSecondary: {
      label: "What's available?",
      href: whatsappLink("What desktop computers do you have in stock?"),
      icon: <MessageCircle className="size-4" />,
    },
  },
  {
    id: "accessories",
    num: "03",
    label: "Accessories",
    image: "/images/accessories.png",
    badge: { icon: <Shield className="size-3.5" />, text: "Genuine Parts" },
    headline: "Accessories Built to Last and Priced Right",
    highlight: "Priced Right",
    subhead: "Cables, cases, keyboards and more. Genuine parts at shop prices.",
    ctaPrimary: { label: "Shop accessories", href: "/shop?category=accessories" },
    ctaSecondary: {
      label: "Ask about deals",
      href: whatsappLink("What accessories do you recommend for my laptop?"),
      icon: <MessageCircle className="size-4" />,
    },
  },
]

function HighlightedHeadline({ text, highlight, delay = 0 }: { text: string; highlight: string; delay?: number }) {
  const words = text.split(" ")
  const highlightWords = highlight.split(" ")

  return (
    <span className="block" aria-label={text}>
      {words.map((word, i) => {
        const isHighlighted = highlightWords.includes(word.replace(/[.,!?]/g, ""))
        return (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom mr-[0.3em]">
            <motion.span
              className="inline-block"
              aria-hidden
              initial={{ y: "120%", rotateX: -40 }}
              animate={{ y: 0, rotateX: 0 }}
              transition={{
                duration: 0.8,
                delay: delay + i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="text-white">{word}</span>
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

export function Hero({ highlight }: { highlight: ProductView | null }) {
  const [current, setCurrent] = useState(0)

  const slideCount = SLIDES.length

  const nextSlide = useCallback(() => {
    setCurrent((c) => (c + 1) % slideCount)
  }, [slideCount])

  const prevSlide = useCallback(() => {
    setCurrent((c) => (c - 1 + slideCount) % slideCount)
  }, [slideCount])

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slide = SLIDES[current]

  return (
    <section className="relative isolate h-[92vh] min-h-[560px] max-h-[820px] overflow-hidden bg-black select-none">
      {/* Background slide transition */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={slide.image}
              alt={slide.headline}
              fill
              priority={current === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/25 pointer-events-none" />

      {/* ── ULTRA-LUXURY CIRCULAR PROGRESS CONTROLS (Top Right) ── */}
      <div className="absolute top-7 right-6 sm:right-10 z-30 flex items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-full bg-black/40 p-1.5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {SLIDES.map((item, i) => {
            const isActive = i === current
            const size = 46
            const strokeWidth = 2
            const radius = (size - strokeWidth) / 2
            const circumference = 2 * Math.PI * radius

            return (
              <button
                key={item.id}
                onClick={() => setCurrent(i)}
                className="group relative flex items-center gap-2.5 rounded-full transition-all duration-500 focus:outline-none"
                aria-label={`Go to slide ${i + 1}: ${item.label}`}
              >
                {/* Active Pill Extension with Label */}
                {isActive && (
                  <motion.div
                    layoutId="activeLuxuryCapsule"
                    className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  />
                )}

                <div
                  className="relative flex items-center justify-center rounded-full"
                  style={{ width: size, height: size }}
                >
                  {/* Luxury SVG Ring */}
                  <svg
                    width={size}
                    height={size}
                    className="absolute inset-0 -rotate-90 pointer-events-none"
                  >
                    {/* Hair-thin track ring */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />

                    {/* Precision Laser Process Ring */}
                    {isActive && (
                      <motion.circle
                        key={current}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#ffffff"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 6, ease: "linear" }}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      />
                    )}
                  </svg>

                  {/* Clean Swiss-style Number */}
                  <span
                    className={`relative z-10 font-mono text-xs font-semibold tracking-wider transition-colors duration-300 ${
                      isActive ? "text-white" : "text-white/35 group-hover:text-white/70"
                    }`}
                  >
                    {item.num}
                  </span>
                </div>

                {/* Subdued Category Label when active */}
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="pr-4 text-[0.72rem] font-medium tracking-wide uppercase text-white/90 hidden md:inline-block select-none"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content — bottom left */}
      <div className="absolute inset-x-0 bottom-0 container-page pb-12 z-10">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-4"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-xs font-medium text-white/80">
                  <span className="text-brand">{slide.badge.icon}</span>
                  {slide.badge.text}
                </span>
              </motion.div>

              {/* Headline with word-by-word animation */}
              <h1 className="text-[clamp(2rem,4.8vw,3.25rem)] font-bold leading-[1.12] tracking-tight text-balance">
                <HighlightedHeadline text={slide.headline} highlight={slide.highlight} delay={0.15} />
              </h1>

              {/* Subheading */}
              <motion.p
                className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-white/60"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {slide.subhead}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* CTAs */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`ctas-${slide.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="mt-6 sm:mt-7 flex flex-col sm:flex-row gap-2.5 sm:gap-3"
            >
              <Link
                href={slide.ctaPrimary.href}
                className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-xl bg-brand px-5 sm:px-6 text-sm font-semibold text-white transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/25 active:translate-y-px"
              >
                {slide.ctaPrimary.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href={slide.ctaSecondary.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 sm:px-6 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/25 active:translate-y-px"
              >
                {slide.ctaSecondary.icon}
                {slide.ctaSecondary.label}
              </a>
            </motion.div>
          </AnimatePresence>

          {/* Stats strip */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-x-8 gap-y-4 sm:gap-x-6 sm:gap-y-3 sm:flex sm:flex-wrap border-t border-white/10 pt-5 sm:pt-6">
            {[
              { value: `Since ${site.since}`, label: "Trusted in Karachi" },
              { value: "6-month", label: "Warranty" },
              { value: "Nationwide", label: "Delivery" },
              { value: "COD", label: "Available" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-xs sm:text-sm font-semibold text-white">{value}</p>
                <p className="text-[0.65rem] sm:text-[0.7rem] text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation arrows (Minimal & Sleek) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/70 transition-all hover:bg-black/60 hover:text-white active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/70 transition-all hover:bg-black/60 hover:text-white active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="size-5" />
      </button>
    </section>
  )
}

