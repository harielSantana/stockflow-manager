import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  getUpstreamBaseUrl,
  isAllowedProxyPath,
  SESSION_COOKIE_NAME,
} from "@/lib/server/upstream"

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function sessionCookieOptions() {
  return {
    httpOnly: true,
    path: "/" as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_COOKIE_MAX_AGE,
  }
}

async function getBearerFromCookie(): Promise<string | null> {
  const store = await cookies()
  return store.get(SESSION_COOKIE_NAME)?.value ?? null
}

function upstreamPathFromSegments(segments: string[]): string {
  return "/" + segments.join("/")
}

function isAuthLoginOrRegister(segments: string[], method: string): boolean {
  return (
    method === "POST" &&
    segments.length === 2 &&
    segments[0] === "auth" &&
    (segments[1] === "login" || segments[1] === "register")
  )
}

function isAuthLogout(segments: string[], method: string): boolean {
  return (
    method === "POST" &&
    segments.length === 2 &&
    segments[0] === "auth" &&
    segments[1] === "logout"
  )
}

function isPublicAuth(segments: string[]): boolean {
  return (
    segments.length === 2 &&
    segments[0] === "auth" &&
    (segments[1] === "login" || segments[1] === "register")
  )
}

function passthroughHeaders(upstreamRes: Response): Headers {
  const out = new Headers()
  const ct = upstreamRes.headers.get("content-type")
  if (ct) out.set("content-type", ct)
  const cd = upstreamRes.headers.get("content-disposition")
  if (cd) out.set("content-disposition", cd)
  return out
}

async function handleProxy(
  request: NextRequest,
  method: string,
  segments: string[]
): Promise<Response> {
  if (!isAllowedProxyPath(segments)) {
    return NextResponse.json({ message: "Nao permitido" }, { status: 403 })
  }

  const base = getUpstreamBaseUrl()
  const path = upstreamPathFromSegments(segments)
  const search = request.nextUrl.search
  const url = `${base}${path}${search}`

  const token = await getBearerFromCookie()

  if (isAuthLogout(segments, method) && !token) {
    const res = NextResponse.json({ ok: true })
    res.cookies.delete(SESSION_COOKIE_NAME)
    return res
  }

  if (!isPublicAuth(segments) && !token) {
    return NextResponse.json({ message: "Nao autorizado" }, { status: 401 })
  }

  const hasBody = !["GET", "HEAD"].includes(method)
  const body = hasBody ? await request.arrayBuffer() : undefined

  const headers = new Headers()
  const ct = request.headers.get("content-type")
  if (hasBody && ct) headers.set("content-type", ct)
  const accept = request.headers.get("accept")
  if (accept) headers.set("accept", accept)
  if (token && !isPublicAuth(segments)) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const upstreamRes = await fetch(url, {
    method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
  })

  if (isAuthLoginOrRegister(segments, method) && upstreamRes.ok) {
    const text = await upstreamRes.text()
    let data: unknown
    try {
      data = text ? (JSON.parse(text) as unknown) : null
    } catch {
      return new NextResponse(text, {
        status: upstreamRes.status,
        headers: passthroughHeaders(upstreamRes),
      })
    }
    if (
      typeof data === "object" &&
      data !== null &&
      "user" in data &&
      "accessToken" in data &&
      typeof (data as { accessToken: unknown }).accessToken === "string"
    ) {
      const { user, accessToken } = data as {
        user: unknown
        accessToken: string
      }
      const res = NextResponse.json({ user })
      res.cookies.set(
        SESSION_COOKIE_NAME,
        accessToken,
        sessionCookieOptions()
      )
      return res
    }
    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: passthroughHeaders(upstreamRes),
    })
  }

  if (isAuthLogout(segments, method) && upstreamRes.ok) {
    const text = await upstreamRes.text()
    const res = new NextResponse(text, {
      status: upstreamRes.status,
      headers: passthroughHeaders(upstreamRes),
    })
    res.cookies.delete(SESSION_COOKIE_NAME)
    return res
  }

  return new NextResponse(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: passthroughHeaders(upstreamRes),
  })
}

type RouteParams = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, ctx: RouteParams) {
  const { path } = await ctx.params
  return handleProxy(request, "GET", path ?? [])
}

export async function POST(request: NextRequest, ctx: RouteParams) {
  const { path } = await ctx.params
  return handleProxy(request, "POST", path ?? [])
}

export async function PATCH(request: NextRequest, ctx: RouteParams) {
  const { path } = await ctx.params
  return handleProxy(request, "PATCH", path ?? [])
}

export async function DELETE(request: NextRequest, ctx: RouteParams) {
  const { path } = await ctx.params
  return handleProxy(request, "DELETE", path ?? [])
}
