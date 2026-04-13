import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  AUTH_COOKIE_NAME,
} from "@/lib/server/auth-cookie"
import { getServerApiBaseUrl } from "@/lib/server/backend-fetch"
import { getOrCreateRequestId } from "@/lib/server/request-id"
import {
  backendPathFromSegments,
  isGatewayPathAllowed,
} from "@/lib/api/routes"

async function proxy(req: NextRequest, segments: string[]) {
  const requestId = getOrCreateRequestId(req)
  const method = req.method

  if (!isGatewayPathAllowed(segments, method)) {
    return NextResponse.json(
      { message: "Operacao nao permitida" },
      { status: 403, headers: { "x-request-id": requestId } }
    )
  }

  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json(
      { message: "Nao autenticado" },
      { status: 401, headers: { "x-request-id": requestId } }
    )
  }

  const backendPath = backendPathFromSegments(segments)
  const url = `${getServerApiBaseUrl()}${backendPath}${req.nextUrl.search}`

  const headers = new Headers()
  headers.set("Authorization", `Bearer ${token}`)
  headers.set("X-Request-Id", requestId)

  const contentType = req.headers.get("content-type")
  if (contentType) {
    headers.set("Content-Type", contentType)
  }

  let body: string | undefined
  if (method !== "GET" && method !== "HEAD") {
    body = await req.text()
  }

  const backendRes = await fetch(url, {
    method,
    headers,
    body: body && body.length > 0 ? body : undefined,
  })

  const resText = await backendRes.text()
  const out = new NextResponse(resText, {
    status: backendRes.status,
    headers: { "x-request-id": requestId },
  })
  const ct = backendRes.headers.get("content-type")
  if (ct) {
    out.headers.set("content-type", ct)
  }
  return out
}

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path)
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path)
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path)
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path)
}
