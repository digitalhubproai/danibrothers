"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ProductThumb } from "@/components/product/product-thumb"
import { cn } from "@/lib/utils"
import { ZoomIn } from "lucide-react"

export function ProductGallery({
  images,
  alt,
  priority = true,
}: {
  images: string[]
  alt: string
  priority?: boolean
}) {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()
  const active = images[index] ?? images[0] ?? null
  const hasMany = images.length > 1

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={active ?? "empty"}
            initial={reduced ? false : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <ProductThumb
              src={active}
              alt={alt}
              sizes="(min-width: 1024px) 42vw, 92vw"
              priority={priority}
              className="transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1.5 text-[0.65rem] font-medium text-white/70 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <ZoomIn className="size-3" />
          Hover to zoom
        </div>

        {/* Image counter */}
        {hasMany && (
          <div className="absolute top-3 right-3 z-20 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[0.65rem] font-semibold text-white/80 tnum">
            {index + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMany && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={`${image}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === index}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 sm:size-20",
                i === index
                  ? "border-brand shadow-md shadow-brand/15"
                  : "border-border/50 opacity-60 hover:opacity-100 hover:border-border",
              )}
            >
              <ProductThumb src={image} alt="" sizes="5rem" />
              {i === index && (
                <div className="absolute inset-0 ring-2 ring-inset ring-brand/20 rounded-xl" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
