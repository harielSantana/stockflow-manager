import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME } from "@/lib/server/auth-cookie"
import { fetchBackend } from "@/lib/server/backend-fetch"
import { getOrCreateRequestId } from "@/lib/server/request-id"

export async function GET(req: Request) {
  const requestId = getOrCreateRequestId(req)
  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json(
      { message: "Nao autenticado" },
      { status: 401, headers: { "x-request-id": requestId } }
    )
  }

  const backendRes = await fetchBackend("/auth/me", {
    method: "GET",
    accessToken: token,
    headers: { "X-Request-Id": requestId },
  })

  const text = await backendRes.text()
  return new NextResponse(text, {
    status: backendRes.status,
    headers: {
      "content-type":
        backendRes.headers.get("content-type") || "application/json",
      "x-request-id": requestId,
    },
  })
}
