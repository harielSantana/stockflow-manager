import "server-only"

/**
 * URL do backend chamada apenas nas Route Handlers (servidor).
 * Prefira API_URL (nao vai para o bundle do cliente): na Vercel use a origem direta
 * se o dominio publico estiver atras do Cloudflare com desafio a bots.
 */
export function getServerApiBaseUrl(): string {
  const url =
    process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim()
  if (!url) {
    throw new Error(
      "Defina API_URL (recomendado) ou NEXT_PUBLIC_API_URL para o BFF no servidor."
    )
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
