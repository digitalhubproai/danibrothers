import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { getSession } from "@/lib/auth"
import { safeNext } from "@/lib/validation"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next
  const next = safeNext(rawNext ?? "")

  const session = await getSession()
  if (session) redirect(next)

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders, download invoices and manage your details."
    >
      <LoginForm next={next} />
    </AuthShell>
  )
}
