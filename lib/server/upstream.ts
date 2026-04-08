/** Sem http(s):// o fetch usa o protocolo adequado para localhost vs demais hosts. */
export function normalizeUpstreamBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "")
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const isLocal =
    /^localhost(?::|$)/i.test(trimmed) || /^127\.0\.0\.1(?::|$)/.test(trimmed)
  return `${isLocal ? "http" : "https"}://${trimmed}`
}

export function getUpstreamBaseUrl(): string {
  const raw = process.env.API_URL?.trim()
  if (!raw) {
    throw new Error(
      "Defina API_URL no .env (somente servidor), ex.: https://api.exemplo.com ou http://localhost:3001"
    )
  }
  return normalizeUpstreamBaseUrl(raw)
}

/** Cookie httpOnly com o JWT; o cliente nunca lê o valor. */
export const SESSION_COOKIE_NAME = "gestao_session"

function isResourceIdSegment(s: string): boolean {
  return s.length > 0 && s.length <= 128 && !/[/\\]/.test(s) && !s.includes("..")
}

/**
 * Limita quais paths podem ser encaminhados ao backend (evita abuso do proxy).
 */
export function isAllowedProxyPath(segments: string[]): boolean {
  if (segments.length === 0) return false
  if (segments.some((s) => s.includes("..") || s === "")) return false

  const [a, b] = segments

  switch (a) {
    case "auth":
      return (
        segments.length === 2 &&
        ["login", "register", "logout", "me"].includes(b)
      )
    case "export":
      return segments.length === 2 && b === "backup"
    case "categories":
    case "products":
    case "stock-entries":
    case "stock-exits":
    case "fixed-costs":
      if (segments.length === 1) return true
      if (segments.length === 2) return isResourceIdSegment(b)
      return false
    default:
      return false
  }
}
