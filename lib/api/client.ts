const TOKEN_KEY = "gestao_api_token"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function getApiToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setApiToken(token: string | null): void {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/** Sem http(s):// o fetch trata a string como path relativo ao site atual (ex.: Vercel + dominio da API). */
function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "")
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const isLocal =
    /^localhost(?::|$)/i.test(trimmed) || /^127\.0\.0\.1(?::|$)/.test(trimmed)
  return `${isLocal ? "http" : "https"}://${trimmed}`
}

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (!raw) {
    throw new Error(
      "Defina NEXT_PUBLIC_API_URL no .env (ex: https://api.exemplo.com ou http://localhost:3001)"
    )
  }
  return normalizeApiBaseUrl(raw)
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const base = getApiBaseUrl()
  const { body, auth = true, headers: initHeaders, ...rest } = options

  const headers = new Headers(initHeaders)
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  if (auth) {
    const token = getApiToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers,
    body:
      body === undefined || body instanceof FormData
        ? (body as BodyInit | undefined)
        : JSON.stringify(body),
  })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : res.statusText || "Erro na requisicao"
    throw new ApiError(res.status, msg)
  }

  return data as T
}
