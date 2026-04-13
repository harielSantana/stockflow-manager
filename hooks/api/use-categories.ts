"use client"

import { useState, useEffect } from "react"
import { listCategoriesApi } from "@/lib/api"
import type { Category } from "@/lib/types"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await listCategoriesApi()
        if (!cancelled) setCategories(list)
      } catch {
        if (!cancelled) setCategories([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, isLoading }
}
