"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MessageCircle, Sparkles, Zap, Shield } from "lucide-react"
import { site, whatsappLink } from "@/lib/site"
import { motion, AnimatePresence } from "motion/react"
import { useEffect, useState, useCallback } from "react"
import type { ProductView } from "@/lib/products"

const SLIDES = [
  {
    id: "laptops",
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
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  const slideCount = SLIDES.length

  const nextSlide = useCallback(() => {
    setDirection("forward")
    setCurrent((c) => (c + 1) % slideCount)
  }, [slideCount])

  const prevSlide = useCallback(() => {
    setDirection("backward")
    setCurrent((c) => (c - 1 + slideCount) % slideCount)
  }, [slideCount])

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slide = SLIDES[current]

  return (
    <section className="relative isolate h-[92vh] min-h-[560px] max-h-[820px] overflow-hidden">
      {/* Full background image with slide transition */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={slide.image}
              alt={slide.id === "laptops" ? "Laptops at Dani Brothers" : slide.id}
              fill
              priority={current === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dark gradient overlay — stronger at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      {/* Grid pattern — subtle depth */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Slide dots — top center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? "forward" : "backward")
              setCurrent(i)
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current
                ? "bg-brand w-10 shadow-lg shadow-brand/30"
                : "bg-white/20 hover:bg-white/40 w-5"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
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
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-5"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 text-xs font-medium text-white/80">
                  <span className="text-brand">{slide.badge.icon}</span>
                  {slide.badge.text}
                </span>
              </motion.div>

              {/* Headline with word-by-word animation */}
              <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-balance">
                <HighlightedHeadline text={slide.headline} highlight={slide.highlight} delay={0.2} />
              </h1>

              {/* Subheading */}
              <motion.p
                className="mt-4 max-w-sm text-sm leading-relaxed text-white/55"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {slide.subhead}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* CTAs */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`ctas-${slide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Link
                href={slide.ctaPrimary.href}
                className="group inline-flex h-11 items-center gap-2.5 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/25 active:translate-y-px"
              >
                {slide.ctaPrimary.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href={slide.ctaSecondary.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/25 active:translate-y-px"
              >
                {slide.ctaSecondary.icon}
                {slide.ctaSecondary.label}
              </a>
            </motion.div>
          </AnimatePresence>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6"
          >
            {[
              { value: `Since ${site.since}`, label: "Trusted in Karachi" },
              { value: "6-month", label: "Warranty" },
              { value: "Nationwide", label: "Delivery" },
              { value: "COD", label: "Available" },
            ].map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
              >
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="text-[0.7rem] text-white/40">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 transition-all hover:bg-white/10 hover:text-white"
        aria-label="Previous slide"
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 transition-all hover:bg-white/10 hover:text-white"
        aria-label="Next slide"
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
