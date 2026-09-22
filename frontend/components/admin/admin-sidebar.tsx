"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShoppingCart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/app/actions/auth"

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300",
              active
                ? "bg-brand text-white shadow-md shadow-brand/25"
                : "text-muted-foreground hover:bg-brand/5 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-transform duration-300",
                active ? "" : "group-hover:scale-110",
              )}
            />
            {label}
          </Link>
        )
      })}

      <div className="my-3 border-t border-border" />

      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground"
      >
        <ExternalLink className="size-4" />
        View storefront
      </Link>

      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-destructive/5 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </form>
    </nav>
  )
}
