import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  AUTH_COOKIE_NAME,
  clearAccessTokenCookieOptions,
} from "@/lib/server/auth-cookie"
import { fetchBackend } from "@/lib/server/backend-fetch"
import { getOrCreateRequestId } from "@/lib/server/request-id"

export async function POST(req: Request) {
  const requestId = getOrCreateRequestId(req)
  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE_NAME)?.value ?? null

  if (token) {
    try {
      await fetchBackend("/auth/logout", {
        method: "POST",
        accessToken: token,
        headers: { "X-Request-Id": requestId },
      })
    } catch {
      // Stateless: seguimos para limpar o cookie
    }
  }

  const res = NextResponse.json(
    {},
    { headers: { "x-request-id": requestId } }
  )
  res.cookies.set(AUTH_COOKIE_NAME, "", clearAccessTokenCookieOptions())
  return res
}
