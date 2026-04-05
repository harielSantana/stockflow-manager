"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { CotacaoSimulador } from "@/components/cotacao/cotacao-simulador"
import { listProductsApi } from "@/lib/api"
import type { Product } from "@/lib/types"

export default function CotacaoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await listProductsApi()
        if (!cancelled) {
          setProducts(list)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setProducts([])
          setError("Nao foi possivel carregar os produtos.")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
