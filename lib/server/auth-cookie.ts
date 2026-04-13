import "server-only"
import { AUTH_COOKIE_NAME } from "@/lib/api/routes"

const SEVEN_DAYS = 60 * 60 * 24 * 7

export function accessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SEVEN_DAYS,
  }
}

export function clearAccessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }
}

export { AUTH_COOKIE_NAME }
