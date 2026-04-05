"use client"

import { useEffect, useState } from "react"
import {
  getStockEntryApi,
  getStockExitApi,
  ApiError,
} from "@/lib/api"
import type { MovementEditRecord } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MovementEditHistory } from "@/components/movimentacoes/movement-edit-history"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Target = { type: "entry" | "exit"; id: string } | null

interface MovementHistoryDialogProps {
  target: Target
  onOpenChange: (open: boolean) => void
}

export function MovementHistoryDialog({
  target,
  onOpenChange,
}: MovementHistoryDialogProps) {
  const open = Boolean(target)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<MovementEditRecord[]>([])

  useEffect(() => {
    if (!target) {
      setRecords([])
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setRecords([])
    ;(async () => {
      try {
        const row =
          target.type === "entry"
            ? await getStockEntryApi(target.id)
            : await getStockExitApi(target.id)
        if (!cancelled) {
          setRecords(row.editHistory ?? [])
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : "Nao foi possivel carregar o historico."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [target?.type, target?.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Historico de alteracoes</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma alteracao registrada para esta movimentacao.
          </p>
        ) : (
          <MovementEditHistory records={records} embedded />
        )}
      </DialogContent>
    </Dialog>
  )
}
