"use client"

import { Header } from "@/components/dashboard/header"
import { ProductForm } from "@/components/estoque/product-form"
import { useCategories } from "@/hooks/api/use-categories"

export default function NovoProductPage() {
  const { categories } = useCategories()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Novo Produto" />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
