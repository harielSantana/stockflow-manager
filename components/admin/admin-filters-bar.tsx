"use client"

import { cn } from "@/lib/utils"

type AdminFiltersBarProps = {
  children: React.ReactNode
  className?: string
}

export function AdminFiltersBar({ children, className }: AdminFiltersBarProps) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-lg border bg-card/60 p-3 md:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}
