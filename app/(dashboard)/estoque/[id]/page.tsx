"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { ProductForm } from "@/components/estoque/product-form"
import { getProductApi, listCategoriesApi } from "@/lib/api"
import type { Product, Category } from "@/lib/types"

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [prod, cats] = await Promise.all([
          getProductApi(id),
          listCategoriesApi(),
        ])
        if (!cancelled) {
          setProduct(prod)
          setCategories(cats)
        }
      } catch {
        if (!cancelled) router.push("/estoque")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, router])

  if (loading || !product) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Carregando..." />
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando produto...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Editar Produto" />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  )
}
