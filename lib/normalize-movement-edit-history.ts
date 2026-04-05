import type { MovementEditRecord } from "@/lib/types"

/**
 * Converte historico vindo da API (formato novo ou legado com at/from/to/editedBy)
 * para o formato esperado pela UI (editedAt, previous, next, editedByName).
 */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function toDisplayValue(v: unknown): string | number | null {
  if (v === undefined || v === null) return null
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") return v
  if (typeof v === "boolean") return v ? "true" : "false"
  return String(v)
}

function normalizeChange(raw: unknown): MovementEditRecord["changes"][number] | null {
  if (!isRecord(raw)) return null
  const field = typeof raw.field === "string" ? raw.field : null
  const label = typeof raw.label === "string" ? raw.label : ""
  if (!field) return null

  const previous =
    "previous" in raw
      ? toDisplayValue(raw.previous)
      : "from" in raw
        ? toDisplayValue(raw.from)
        : null
  const next =
    "next" in raw ? toDisplayValue(raw.next) : "to" in raw ? toDisplayValue(raw.to) : null

  return { field, label, previous, next }
}

function normalizeRecord(raw: unknown, index: number): MovementEditRecord | null {
  if (!isRecord(raw)) return null

  const editedAt =
    typeof raw.editedAt === "string"
      ? raw.editedAt
      : typeof raw.at === "string"
        ? raw.at
        : null
  if (!editedAt) return null

  let editedByUserId: string | undefined
  let editedByName: string | undefined

  if (isRecord(raw.editedBy)) {
    if (typeof raw.editedBy.id === "string") editedByUserId = raw.editedBy.id
    if (typeof raw.editedBy.name === "string") editedByName = raw.editedBy.name
  }
  if (typeof raw.editedByUserId === "string") editedByUserId = raw.editedByUserId
  if (typeof raw.editedByName === "string") editedByName = raw.editedByName

  const changesRaw = Array.isArray(raw.changes) ? raw.changes : []
  const changes = changesRaw
    .map(normalizeChange)
    .filter((c): c is MovementEditRecord["changes"][number] => c != null)

  const id =
    typeof raw.id === "string" && raw.id.length > 0 ? raw.id : `legacy-${editedAt}-${index}`

  return {
    id,
    editedAt,
    ...(editedByUserId ? { editedByUserId } : {}),
    ...(editedByName ? { editedByName } : {}),
    changes,
  }
}

export function normalizeMovementEditRecords(raw: unknown): MovementEditRecord[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeRecord).filter((r): r is MovementEditRecord => r != null)
}
