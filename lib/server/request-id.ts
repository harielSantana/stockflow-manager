import "server-only"
import { randomUUID } from "crypto"

export function getOrCreateRequestId(req: Request): string {
  return req.headers.get("x-request-id")?.trim() || randomUUID()
}
