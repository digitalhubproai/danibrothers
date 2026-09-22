"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  MessageCircle,
  Sparkles,
  Zap,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { site, whatsappLink } from "@/lib/site"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useEffect, useState, useCallback, useRef } from "react"

const SLIDE_MS = 6500

const SLIDES = [
  {
    id: "laptops",
    num: "01",
    label: "Laptops",
    image: "/images/pc with laptop.png",
    badge: { icon: <Sparkles className="size-3.5" />, text: "Fresh Stock" },
    headline: "Laptops You Can Trust at Prices That Make Sense",
    highlight: "Prices That Make Sense",
    subhead:
      "Every machine tested and warranted. Buy in store or delivered anywhere in Pakistan.",
    ctaPrimary: { label: "Browse laptops", href: "/shop" },
    ctaSecondary: {
      label: "WhatsApp us",
      href: whatsappLink("Hi, I'm looking for a laptop."),
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
    subhead:
      "From budget builds to pro rigs, we have got the parts and the know-how.",
    ctaPrimary: { label: "Shop computers", href: "/shop?category=desktops" },
    ctaSecondary: {
      label: "What's available?",
      href: whatsappLink("What desktop computers do you have in stock?"),
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
    subhead:
      "Cables, cases, keyboards and more. Genuine parts at shop prices.",
    ctaPrimary: {
      label: "Shop accessories",
      href: "/shop?category=accessories",
    },
    ctaSecondary: {
      label: "Ask about deals",
      href: whatsappLink(
        "What accessories do you recommend for my laptop?",
      ),
    },
  },
]

function HighlightedHeadline({
  text,
  highlight,
  delay = 0,
}: {
  text: string
  highlight: string
  delay?: number
}) {
  const words = text.split(" ")
  const highlightWords = new Set(
    highlight
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[.,!?]/g, "")),
  )

  return (
    <span className="block" aria-label={text}>
      {words.map((word, i) => {
        const plain = word.toLowerCase().replace(/[.,!?]/g, "")
        const isHighlighted = highlightWords.has(plain)
        return (
          <span
            key={`${word}-${i}`}
            className="mr-[0.28em] inline-block overflow-hidden align-bottom"
          >
            <motion.span
              className="inline-block"
              aria-hidden
              initial={{ y: "120%", rotateX: -35 }}
              animate={{ y: 0, rotateX: 0 }}
              transition={{
                duration: 0.75,
                delay: delay + i * 0.045,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span
                className={
                  isHighlighted
                    ? "bg-gradient-to-r from-white via-white to-brand/70 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(29,78,216,0.35)]"
                    : "text-white"
                }
              >
                {word}
              </span>
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

export function Hero() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  const slideCount = SLIDES.length

  const nextSlide = useCallback(() => {
    setCurrent((c) => (c + 1) % slideCount)
  }, [slideCount])

  const prevSlide = useCallback(() => {
    setCurrent((c) => (c - 1 + slideCount) % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (paused || reduceMotion) return
    const timer = window.setInterval(nextSlide, SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [nextSlide, paused, reduceMotion])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") nextSlide()
      if (e.key === "ArrowLeft") prevSlide()
    }
    el.addEventListener("keydown", onKey)
    return () => el.removeEventListener("keydown", onKey)
  }, [nextSlide, prevSlide])

  const slide = SLIDES[current]

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured categories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative isolate h-[min(92vh,820px)] min-h-[560px] select-none overflow-hidden bg-black outline-none"
    >
      {/* Background slides */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={current === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Readability overlays: left for copy, bottom for depth, soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/35"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand/25 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent"
      />

      {/* Slide indicators — top right */}
      <div className="absolute top-6 right-4 z-30 sm:right-8 sm:top-8">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          {SLIDES.map((item, i) => {
            const isActive = i === current
            const size = 44
            const strokeWidth = 2
            const radius = (size - strokeWidth) / 2
            const circumference = 2 * Math.PI * radius

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(i)}
                className="group relative flex items-center gap-2 rounded-full transition-all duration-500 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label={`Go to slide ${i + 1}: ${item.label}`}
                aria-current={isActive ? "true" : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="heroActivePill"
                    className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.08] backdrop-blur-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}

                <div
                  className="relative flex items-center justify-center rounded-full"
                  style={{ width: size, height: size }}
                >
                  <svg
                    width={size}
                    height={size}
                    className="pointer-events-none absolute inset-0 -rotate-90"
                    aria-hidden
                  >
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    {isActive && !reduceMotion && (
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
                        transition={{
                          duration: paused || reduceMotion ? 0 : SLIDE_MS / 1000,
                          ease: "linear",
                        }}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.75)]"
                      />
                    )}
                    {isActive && (paused || reduceMotion) && (
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#ffffff"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * 0.55}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.75)]"
                      />
                    )}
                  </svg>

                  <span
                    className={`relative z-10 font-mono text-xs font-semibold tracking-wider transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-white/35 group-hover:text-white/75"
                    }`}
                  >
                    {item.num}
                  </span>
                </div>

                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="hidden pr-4 text-[0.72rem] font-medium tracking-wide text-white/90 uppercase select-none md:inline-block"
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
      <div className="absolute inset-x-0 bottom-0 z-10 container-page pb-10 sm:pb-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.4 }}
                className="mb-4"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-black/40 px-4 py-1.5 text-xs font-medium text-white/85 shadow-[0_0_24px_rgba(0,0,0,0.3)] backdrop-blur-md">
                  <span className="text-brand">{slide.badge.icon}</span>
                  {slide.badge.text}
                </span>
              </motion.div>

              <h1 className="text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.1] font-bold tracking-tight text-balance">
                <HighlightedHeadline
                  text={slide.headline}
                  highlight={slide.highlight}
                  delay={0.12}
                />
              </h1>

              <motion.p
                className="mt-4 max-w-md text-sm leading-relaxed text-white/65 sm:text-base"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                {slide.subhead}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`ctas-${slide.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.15,
              }}
              className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3"
            >
              <Link
                href={slide.ctaPrimary.href}
                className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:bg-brand/90 hover:shadow-brand/40 active:translate-y-px"
              >
                {slide.ctaPrimary.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href={slide.ctaSecondary.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/15 active:translate-y-px"
              >
                <MessageCircle className="size-4" />
                {slide.ctaSecondary.label}
              </a>
            </motion.div>
          </AnimatePresence>

          {/* Trust strip */}
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/10 pt-5 sm:mt-8 sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:pt-6">
            {[
              { value: `Since ${site.since}`, label: "Trusted in Karachi" },
              { value: "6-month", label: "Warranty" },
              { value: "Nationwide", label: "Delivery" },
              { value: "COD", label: "Available" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-xs font-semibold text-white sm:text-sm">
                  {value}
                </p>
                <p className="text-[0.65rem] text-white/45 sm:text-[0.7rem]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute top-1/2 left-3 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/70 backdrop-blur-md transition-all hover:border-white/25 hover:bg-black/60 hover:text-white active:scale-95 sm:left-5"
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute top-1/2 right-3 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/70 backdrop-blur-md transition-all hover:border-white/25 hover:bg-black/60 hover:text-white active:scale-95 sm:right-5"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Scroll cue */}
      <a
        href="#categories"
        className="absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-white/40 transition-colors hover:text-white/80 md:flex"
        aria-label="Scroll to categories"
      >
        <span className="text-[0.65rem] tracking-[0.18em] uppercase">
          Scroll
        </span>
        <motion.span
          aria-hidden
          className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent"
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </a>
    </section>
  )
}
