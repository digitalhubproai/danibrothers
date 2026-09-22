import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { Shield } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getCurrentUser } from "@/lib/auth"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // proxy.ts gates /admin, but the role check is repeated here: the layout is
  // what actually decides whether admin UI is rendered, and it should not
  // depend on a matcher elsewhere staying correct.
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=%2Fadmin")
  if (user.role !== "ADMIN") redirect("/account")

  return (
    <div className="container-page py-8 md:py-10">
      <div className="grid gap-8 lg:grid-cols-[14rem_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-5 rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm shadow-brand/25">
                <Shield className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-eyebrow text-brand">Admin</p>
                <p className="mt-0.5 truncate text-sm font-semibold">{site.name}</p>
              </div>
            </div>
            <p className="mt-3 truncate border-t border-border pt-3 text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          <AdminSidebar />

          <p className="mt-6 hidden text-xs leading-relaxed text-muted-foreground lg:block">
            Everything you change here goes live on the storefront straight away.
          </p>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
