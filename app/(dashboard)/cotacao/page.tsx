"use client"

import { Header } from "@/components/dashboard/header"
import { CotacaoSimulador } from "@/components/cotacao/cotacao-simulador"
import { useProducts } from "@/hooks/api/use-products"

export default function CotacaoPage() {
  const { products, error } = useProducts({
    errorMessage: "Nao foi possivel carregar os produtos.",
  })

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Cotacao"
        description="Simule vendas e analise margem de lucro sem alterar o estoque"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {error ? (
          <p className="text-center text-sm text-destructive">{error}</p>
        ) : (
          <CotacaoSimulador products={products} />
        )}
      </div>
    </div>
  )
}
