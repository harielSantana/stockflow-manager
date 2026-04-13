"use client"

import { Header } from "@/components/dashboard/header"
import { ExitForm } from "@/components/movimentacoes/exit-form"
import { useProducts } from "@/hooks/api/use-products"

export default function SaidaPage() {
  const { products } = useProducts()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Nova Saida" />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <ExitForm products={products} />
      </div>
    </div>
  )
}
