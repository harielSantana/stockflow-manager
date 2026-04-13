"use client"

import { Header } from "@/components/dashboard/header"
import { EntryForm } from "@/components/movimentacoes/entry-form"
import { useProducts } from "@/hooks/api/use-products"

export default function EntradaPage() {
  const { products } = useProducts()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Nova Entrada" />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <EntryForm products={products} />
      </div>
    </div>
  )
}
