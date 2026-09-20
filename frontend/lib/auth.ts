import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session"

const COOKIE_NAME = SESSION_COOKIE_NAME
const MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS

export type SessionUser = {
  id: string
  name: string
  email: string
  role: "CUSTOMER" | "ADMIN"
}

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Copy .env.example to .env and fill it in.")
  }
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey())
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (typeof payload.id !== "string" || typeof payload.email !== "string") return null
    return {
      id: payload.id,
      name: typeof payload.name === "string" ? payload.name : "",
      email: payload.email,
      role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    }
  } catch {
    // Expired or tampered token — treat as signed out rather than throwing.
    return null
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user)
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

/**
 * Reads the session and confirms the account still exists. Prefer this over
 * `getSession()` on anything that writes — a token stays valid for 7 days, so
 * a deleted or demoted account would otherwise keep its old access.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true },
  })
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN")
  return user
}
