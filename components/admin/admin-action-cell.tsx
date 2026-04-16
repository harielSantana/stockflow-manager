"use client"

import { cn } from "@/lib/utils"

type AdminActionCellProps = {
  children: React.ReactNode
  isSaving?: boolean
  className?: string
}

export function AdminActionCell({ children, isSaving = false, className }: AdminActionCellProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", isSaving && "opacity-70", className)}>
      {children}
      {isSaving ? <span className="text-xs text-muted-foreground">Salvando...</span> : null}
    </div>
  )
}
