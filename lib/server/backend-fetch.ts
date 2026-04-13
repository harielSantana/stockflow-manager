import "server-only"

export function getServerApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (!url) {
    throw new Error("Defina NEXT_PUBLIC_API_URL no .env para o servidor Next (BFF).")
  }
  return url.replace(/\/$/, "")
}

export async function fetchBackend(
  backendPath: string,
  init: RequestInit & { accessToken?: string | null }
): Promise<Response> {
  const base = getServerApiBaseUrl()
  const { accessToken, headers: initHeaders, ...rest } = init
  const headers = new Headers(initHeaders)
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }
  const path = backendPath.startsWith("/") ? backendPath : `/${backendPath}`
  return fetch(`${base}${path}`, {
    ...rest,
    headers,
  })
}
