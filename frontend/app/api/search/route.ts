import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] })
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { brand: { contains: q } },
        { description: { contains: q } },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      price: true,
      condition: true,
      images: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 8,
  })

  const result = products.map((p) => {
    const images: string[] = (() => {
      try {
        const parsed = JSON.parse(p.images)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    })()
    return {
      ...p,
      primaryImage: images[0] ?? null,
    }
  })

  return NextResponse.json({ products: result })
}
