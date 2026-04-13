"use client"

import { useState, useEffect } from "react"
import {
  listProductsApi,
  listCategoriesApi,
  listStockEntriesApi,
  listStockExitsApi,
  listFixedCostsApi,
} from "@/lib/api"
import type {
  Product,
  Category,
  StockEntry,
  StockExit,
  FixedCost,
} from "@/lib/types"

type Options = {
  errorMessage?: string
}

export function useDashboardDatasets(options?: Options) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [exits, setExits] = useState<StockExit[]>([])
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [p, c, e, x, f] = await Promise.all([
          listProductsApi(),
          listCategoriesApi(),
          listStockEntriesApi(),
          listStockExitsApi(),
          listFixedCostsApi(),
        ])
        if (!cancelled) {
          setProducts(p)
          setCategories(c)
          setEntries(e)
          setExits(x)
          setFixedCosts(f)
          setLoadError(null)
        }
      } catch {
        if (!cancelled) {
          setProducts([])
          setCategories([])
          setEntries([])
          setExits([])
          setFixedCosts([])
          setLoadError(
            options?.errorMessage ?? "Nao foi possivel carregar os dados."
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [options?.errorMessage])

  return {
    products,
    categories,
    entries,
    exits,
    fixedCosts,
    loadError,
    isLoading,
  }
}
