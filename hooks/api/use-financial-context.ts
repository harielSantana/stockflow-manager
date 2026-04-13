"use client"

import { useState, useEffect } from "react"
import {
  listProductsApi,
  listStockEntriesApi,
  listStockExitsApi,
  listFixedCostsApi,
} from "@/lib/api"
import type { FinancialData } from "@/lib/calculations"

export function useFinancialContext() {
  const [financialCtx, setFinancialCtx] = useState<FinancialData | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [products, entries, exits, fixedCosts] = await Promise.all([
          listProductsApi(),
          listStockEntriesApi(),
          listStockExitsApi(),
          listFixedCostsApi(),
        ])
        if (!cancelled) {
          setFinancialCtx({ products, entries, exits, fixedCosts })
        }
      } catch {
        if (!cancelled) setFinancialCtx(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return financialCtx
}
