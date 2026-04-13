import { NextResponse } from "next/server"

/** Resposta HTML do desafio Cloudflare; fetch servidor (ex.: Vercel) nao resolve JS challenge. */
function isLikelyCloudflareChallenge(status: number, bodyText: string): boolean {
  if (status !== 403 && status !== 503) return false
  return (
    bodyText.includes("Just a moment") ||
    bodyText.includes("cf-browser-verification") ||
    bodyText.includes("__cf_chl") ||
    bodyText.includes("challenges.cloudflare.com")
  )
}

export function nextResponseFromBackendFailure(
  backendRes: Response,
  bodyText: string,
  requestId: string
): NextResponse {
  if (isLikelyCloudflareChallenge(backendRes.status, bodyText)) {
    return NextResponse.json(
      {
        message:
          "O backend devolveu bloqueio tipo Cloudflare (desafio para browser). Na Vercel, configure API_URL com a URL direta da API (origem, sem passar pelo desafio) ou uma regra no Cloudflare para liberar o IP da Vercel / requisicoes server-to-server.",
      },
      { status: 502, headers: { "x-request-id": requestId } }
    )
  }

  return new NextResponse(bodyText, {
    status: backendRes.status,
    headers: {
      "content-type":
        backendRes.headers.get("content-type") || "application/json",
      "x-request-id": requestId,
    },
  })
}
