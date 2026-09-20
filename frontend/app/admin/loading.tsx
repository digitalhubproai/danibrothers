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
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2.5 h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((card) => (
          <div key={card} className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-4 border-b border-border px-5 py-3.5">
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
