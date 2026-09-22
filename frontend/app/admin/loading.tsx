import { Skeleton } from "@/components/ui/skeleton"

/**
 * Admin loading state.
 *
 * Without this the root `app/loading.tsx` takes over — and that one is shaped
 * like the shop grid, so every admin navigation would flash a product grid
 * that has nothing to do with the page being loaded. This mirrors the admin
 * layout instead: a heading, a row of stat/action cards, then a table.
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-8 w-48" />
        <Skeleton className="mt-2.5 h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((card) => (
          <div key={card} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="mt-4 h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex items-center gap-4 border-b border-border px-5 py-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ml-auto h-8 w-28" />
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="size-10 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
