import { NextResponse } from "next/server"
import {
  AUTH_COOKIE_NAME,
  accessTokenCookieOptions,
} from "@/lib/server/auth-cookie"
import { fetchBackend } from "@/lib/server/backend-fetch"
import { getOrCreateRequestId } from "@/lib/server/request-id"

type AuthResponse = {
  user: unknown
  accessToken: string
}

export async function POST(req: Request) {
  const requestId = getOrCreateRequestId(req)
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { message: "JSON invalido" },
      { status: 400, headers: { "x-request-id": requestId } }
    )
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Request-Id": requestId,
  })

  const backendRes = await fetchBackend("/auth/register", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  const text = await backendRes.text()
  if (!backendRes.ok) {
    return new NextResponse(text, {
      status: backendRes.status,
      headers: {
        "content-type":
          backendRes.headers.get("content-type") || "application/json",
        "x-request-id": requestId,
      },
    })
  }

  let data: AuthResponse
  try {
    data = JSON.parse(text) as AuthResponse
  } catch {
    return NextResponse.json(
      { message: "Resposta invalida da API" },
      { status: 502, headers: { "x-request-id": requestId } }
    )
  }

  if (!data.accessToken || typeof data.accessToken !== "string") {
    return NextResponse.json(
      { message: "Resposta invalida da API" },
      { status: 502, headers: { "x-request-id": requestId } }
    )
  }

  const res = NextResponse.json(
    { user: data.user },
    { headers: { "x-request-id": requestId } }
  )
  res.cookies.set(
    AUTH_COOKIE_NAME,
    data.accessToken,
    accessTokenCookieOptions()
  )
  return res
}
