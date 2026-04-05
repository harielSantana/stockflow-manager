"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { ProductForm } from "@/components/estoque/product-form"
import { listCategoriesApi } from "@/lib/api"
import type { Category } from "@/lib/types"

export default function NovoProductPage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    listCategoriesApi()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Novo Produto" />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
