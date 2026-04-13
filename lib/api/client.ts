export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

function resolveUrl(path: string): string {
  if (path.startsWith("/api/")) {
    return path
  }
  const p = path.startsWith("/") ? path : `/${path}`
  return `/api/gateway${p}`
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = resolveUrl(path)
  const { body, headers: initHeaders, ...rest } = options

  const headers = new Headers(initHeaders)
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const res = await fetch(url, {
    ...rest,
    credentials: "include",
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
