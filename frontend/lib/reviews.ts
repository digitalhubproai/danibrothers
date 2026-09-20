"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Review = {
  id: string
  productId: string
  name: string
  rating: number
  comment: string
  date: string
}

type ReviewsState = {
  reviews: Review[]
  add: (review: Omit<Review, "id" | "date">) => void
  getByProduct: (productId: string) => Review[]
  getAvgRating: (productId: string) => number
  getCount: (productId: string) => number
}

export const useReviews = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],

      add: (review) =>
        set((state) => ({
          reviews: [
            {
              ...review,
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
            },
            ...state.reviews,
          ],
        })),

      getByProduct: (productId) =>
        get().reviews.filter((r) => r.productId === productId),

      getAvgRating: (productId) => {
        const productReviews = get().reviews.filter((r) => r.productId === productId)
        if (productReviews.length === 0) return 0
        return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      },

      getCount: (productId) =>
        get().reviews.filter((r) => r.productId === productId).length,
    }),
    {
      name: "danibrothers-reviews",
    },
  ),
)
