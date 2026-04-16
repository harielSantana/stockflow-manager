/** Cookie httpOnly com o JWT; definido apenas nas rotas BFF de auth. */
export const AUTH_COOKIE_NAME = "sf_access_token"

/** Rotas BFF de autenticação (cliente chama apenas estes paths). */
export const BFF_AUTH_PATHS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
} as const

const RESOURCE_ROOTS = new Set([
  "categories",
  "products",
  "stock-entries",
  "stock-exits",
  "fixed-costs",
])

function segmentsAreSafe(segments: string[]): boolean {
  for (const s of segments) {
    if (!s || s === "." || s === ".." || s.includes("/") || s.includes("\\")) {
      return false
    }
  }
  return true
}

/**
 * Valida método + path relativo ao backend para o gateway (sem leading slash nos segmentos).
 * Espelha os usos atuais em lib/api/index.ts.
 */
export function isGatewayPathAllowed(segments: string[], method: string): boolean {
  if (!segmentsAreSafe(segments) || segments.length === 0) return false

  const [a, b] = segments

  if (a === "export") {
    return (
      segments.length === 2 &&
      b === "backup" &&
      method === "GET"
    )
  }

  if (a === "admin") {
    if (segments.length === 2 && b === "metrics") {
      return method === "GET"
    }
    if (segments.length === 2 && b === "audit-logs") {
      return method === "GET"
    }
    if (segments.length === 2 && b === "users") {
      return method === "GET"
    }
    if (segments.length === 3 && b === "users") {
      return method === "PATCH"
    }
    return false
  }

  if (!RESOURCE_ROOTS.has(a)) return false

  if (segments.length === 1) {
    return method === "GET" || method === "POST"
  }

  if (segments.length === 2) {
    if (!b) return false
    if (a === "categories" || a === "products" || a === "fixed-costs") {
      return (
        method === "GET" ||
        method === "PATCH" ||
        method === "DELETE"
      )
    }
    if (a === "stock-entries" || a === "stock-exits") {
      return method === "GET" || method === "PATCH"
    }
  }

  return false
}

export function backendPathFromSegments(segments: string[]): string {
  return "/" + segments.join("/")
}
