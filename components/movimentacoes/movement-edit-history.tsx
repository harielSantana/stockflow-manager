"use client"

import type { MovementEditRecord } from "@/lib/types"
import { normalizeMovementEditRecords } from "@/lib/normalize-movement-edit-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

function formatValue(v: string | number | null): string {
  if (v === null || v === "") return "—"
  return String(v)
}

interface MovementEditHistoryProps {
  /** Aceita formato da UI ou legado da API (at, from, to, editedBy). */
  records: readonly unknown[] | MovementEditRecord[]
  title?: string
  /** Sem Card externo (ex.: dentro de um dialog). */
  embedded?: boolean
}

function HistoryBody({
  records,
}: {
  records: readonly unknown[] | MovementEditRecord[]
}) {
  const normalized = normalizeMovementEditRecords(records)
  const ordered = [...normalized].sort(
    (a, b) =>
      new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime()
  )

  return (
    <div className="space-y-6">
      {ordered.map((rec, recIndex) => (
        <div
          key={
            rec.id
              ? `${rec.id}-${recIndex}`
              : `edit-${rec.editedAt}-${recIndex}`
          }
          className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-foreground">
              {formatDateTime(rec.editedAt)}
            </span>
            {rec.editedByName && (
              <span className="text-muted-foreground">
                por {rec.editedByName}
              </span>
            )}
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {rec.changes.map((c, i) => (
              <li
                key={`${rec.id ?? rec.editedAt}-${c.field}-${i}-${recIndex}`}
              >
                <span className="text-foreground">{c.label}</span>
                {": "}
                <span>{formatValue(c.previous)}</span>
                {" → "}
                <span>{formatValue(c.next)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function MovementEditHistory({
  records,
  title = "Historico de alteracoes",
  embedded = false,
}: MovementEditHistoryProps) {
  if (!normalizeMovementEditRecords(records ?? []).length) return null

  if (embedded) {
    return <HistoryBody records={records} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <HistoryBody records={records} />
      </CardContent>
    </Card>
  )
}
