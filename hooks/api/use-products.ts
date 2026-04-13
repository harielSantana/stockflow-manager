"use client"

import { useState, useEffect } from "react"
import { listProductsApi } from "@/lib/api"
import type { Product } from "@/lib/types"

type Options = {
  /** Mensagem em caso de falha (ex.: cotacao). Se omitido, error fica null. */
  errorMessage?: string
}

export function useProducts(options?: Options) {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await listProductsApi()
        if (!cancelled) {
          setProducts(list)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setProducts([])
          setError(options?.errorMessage ?? null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [options?.errorMessage])

  return { products, error, isLoading }
}
