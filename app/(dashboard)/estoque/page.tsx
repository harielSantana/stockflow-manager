"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { ProductTable } from "@/components/estoque/product-table"
import { Button } from "@/components/ui/button"
import { listProductsApi, listCategoriesApi } from "@/lib/api"
import type { Product, Category } from "@/lib/types"
import { Plus } from "lucide-react"

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const loadData = async () => {
    const [p, c] = await Promise.all([listProductsApi(), listCategoriesApi()])
    setProducts(p)
    setCategories(c)
  }

  useEffect(() => {
    loadData().catch(() => {
      setProducts([])
      setCategories([])
    })
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Estoque"
        description="Gerencie seus produtos e controle o estoque"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado
              {products.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button asChild>
            <Link href="/estoque/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>

        <ProductTable
          products={products}
          categories={categories}
          onRefresh={loadData}
        />
      </div>
    </div>
  )
}
