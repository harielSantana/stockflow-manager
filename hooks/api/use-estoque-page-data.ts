"use client"

import { useState, useEffect, useCallback } from "react"
import { listProductsApi, listCategoriesApi } from "@/lib/api"
import type { Product, Category } from "@/lib/types"

export function useEstoquePageData() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const refresh = useCallback(async () => {
    const [p, c] = await Promise.all([listProductsApi(), listCategoriesApi()])
    setProducts(p)
    setCategories(c)
  }, [])

  useEffect(() => {
    refresh().catch(() => {
      setProducts([])
      setCategories([])
    })
  }, [refresh])

  return { products, categories, refresh }
}
