"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  type SessionUser,
} from "@/lib/auth"
import { isEmail, minLength, safeNext, str, type ActionResult } from "@/lib/validation"

function toSessionUser(user: {
  id: string
  name: string
  email: string
  role: string
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
  }
}

export async function loginAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const email = str(form, "email").toLowerCase()
  const password = str(form, "password")
  const next = safeNext(str(form, "next"))

  if (!email || !password) {
    return {
      ok: false,
      message: "Enter your email and password.",
      fieldErrors: {
        ...(email ? {} : { email: "Email is required." }),
        ...(password ? {} : { password: "Password is required." }),
      },
    }
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Same message either way — telling an attacker which emails exist is a free
  // account-enumeration oracle.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, message: "Incorrect email or password." }
  }

  await createSession(toSessionUser(user))
  redirect(next)
}

export async function registerAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const name = str(form, "name")
  const email = str(form, "email").toLowerCase()
  const phone = str(form, "phone")
  const password = str(form, "password")
  const next = safeNext(str(form, "next"))

  const fieldErrors: Record<string, string> = {}
  if (!minLength(name, 2)) fieldErrors.name = "Tell us your name."
  if (!isEmail(email)) fieldErrors.email = "That email address doesn't look right."
  if (!minLength(password, 8)) fieldErrors.password = "Use at least 8 characters."
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return {
      ok: false,
      message: "An account with that email already exists.",
      fieldErrors: { email: "Already registered — try signing in instead." },
    }
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
    },
  })

  await createSession(toSessionUser(user))
  redirect(next)
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect("/")
}
