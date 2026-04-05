"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { EntryForm } from "@/components/movimentacoes/entry-form"
import { listProductsApi } from "@/lib/api"
import type { Product } from "@/lib/types"

export default function EntradaPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    listProductsApi()
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Nova Entrada" />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <EntryForm products={products} />
      </div>
    </div>
  )
}
