/**
 * Product imagery.
 *
 * Photos are hotlinked from Unsplash's CDN and mapped by product slug. Keeping
 * them in one file means swapping in real shop photography later is a single
 * edit — drop files into `public/products/` and change the paths here to
 * `/products/<slug>.jpg`.
 *
 * Every URL below is served through `images.unsplash.com` with sizing params,
 * and the host is allow-listed in next.config.ts.
 *
 * ## Why the crops vary
 *
 * Until real photography arrives there is one base photo per category, so a
 * grid of twelve laptops would otherwise show the same picture twelve times.
 * `productImage()` derives a focal point and zoom from the slug, so each card
 * gets a different framing of the shared photo. It is still the same photo —
 * this softens the repetition, it does not remove it. Real per-product shots
 * go in `PRODUCT_IMAGES`, which always wins.
 */

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

/** Shared fallback per category, used when a product has no specific shot. */
export const CATEGORY_IMAGE: Record<string, string> = {
  laptops: U("1517336714731-489689fd1ca8"),
  desktops: U("1587202372775-e229f172b9d7"),
  monitors: U("1527864550417-7fd91fc51a46"),
  "keyboards-mice": U("1587829741301-dc798b83add3"),
  storage: U("1531492746076-161ca9bcad58"),
  components: U("1591799264318-7dbdea508b36"),
  "audio-webcams": U("1546435770-a3e426bf472b"),
  accessories: U("1625842268584-8f3296236761"),
  "security-cctv": U("1557597774-9d273605dfa9"),
}

/** Per-product overrides. Falls back to a category crop. */
export const PRODUCT_IMAGES: Record<string, string[]> = {}

/** Stable across builds and servers — a slug always frames the same way. */
function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Focal points kept off the extreme edges so the subject stays in frame. */
const FOCAL_X = [0.32, 0.45, 0.55, 0.68]
const FOCAL_Y = [0.35, 0.45, 0.55, 0.65]
const ZOOM = [1, 1.15, 1.3, 1.45]

/**
 * The base photo for a product's category, reframed for that product.
 * Unsplash's CDN is imgix, so `crop=focalpoint` + `fp-*` + `fp-z` picks a
 * different window into the same source image.
 */
export function productImage(category: string, slug: string): string | null {
  const base = CATEGORY_IMAGE[category]
  if (!base) return null

  const h = hash(slug)
  const fpX = FOCAL_X[h % FOCAL_X.length]
  const fpY = FOCAL_Y[Math.floor(h / 7) % FOCAL_Y.length]
  const zoom = ZOOM[Math.floor(h / 13) % ZOOM.length]

  return `${base}&crop=focalpoint&fp-x=${fpX}&fp-y=${fpY}&fp-z=${zoom}`
}

/** Every image a product should have, honouring explicit overrides first. */
export function imagesForProduct(category: string, slug: string): string[] {
  const override = PRODUCT_IMAGES[slug]
  if (override?.length) return override

  const framed = productImage(category, slug)
  return framed ? [framed] : []
}
