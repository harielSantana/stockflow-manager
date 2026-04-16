"use client"

import { CircleAlert, DatabaseZap, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type AdminDataStateProps = {
  mode: "loading" | "empty" | "error"
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function AdminDataState({
  mode,
  title,
  description,
  actionLabel,
  onAction,
}: AdminDataStateProps) {
  if (mode === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed bg-card/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Carregando dados...
        </div>
      </div>
    )
  }

  const isError = mode === "error"

  return (
    <Empty className={isError ? "border-destructive/35 bg-destructive/5" : "bg-card/40"}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isError ? <CircleAlert className="h-5 w-5 text-destructive" /> : <DatabaseZap className="h-5 w-5" />}
        </EmptyMedia>
        <EmptyTitle>{title ?? (isError ? "Falha ao carregar" : "Nada para mostrar")}</EmptyTitle>
        <EmptyDescription>
          {description ??
            (isError
              ? "Nao foi possivel concluir esta operacao. Tente novamente."
              : "Ainda nao existem registros para os filtros aplicados.")}
        </EmptyDescription>
      </EmptyHeader>
      {actionLabel && onAction ? (
        <EmptyContent>
          <Button variant={isError ? "destructive" : "outline"} onClick={onAction}>
            {actionLabel}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
