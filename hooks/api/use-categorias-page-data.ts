"use client"

import { useState, useEffect, useCallback } from "react"
import { listCategoriesApi, listProductsApi } from "@/lib/api"
import type { Category, Product } from "@/lib/types"

export function useCategoriasPageData() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const refresh = useCallback(async () => {
    const [c, p] = await Promise.all([listCategoriesApi(), listProductsApi()])
    setCategories(c)
    setProducts(p)
  }, [])

  useEffect(() => {
    refresh().catch(() => setCategories([]))
  }, [refresh])

  return { categories, products, refresh }
}
