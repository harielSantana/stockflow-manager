"use client"

import { useState, useEffect } from "react"
import { listProductsApi, listStockEntriesApi, listStockExitsApi } from "@/lib/api"
import type { Product, StockEntry, StockExit } from "@/lib/types"

export function useMovementsData() {
  const [products, setProducts] = useState<Product[]>([])
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [exits, setExits] = useState<StockExit[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [p, e, x] = await Promise.all([
          listProductsApi(),
          listStockEntriesApi(),
          listStockExitsApi(),
        ])
        if (!cancelled) {
          setProducts(p)
          setEntries(e)
          setExits(x)
        }
      } catch {
        if (!cancelled) {
          setProducts([])
          setEntries([])
          setExits([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { products, entries, exits }
}
