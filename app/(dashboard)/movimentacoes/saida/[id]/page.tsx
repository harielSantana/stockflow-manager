"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { ExitForm } from "@/components/movimentacoes/exit-form"
import { listProductsApi, getStockExitApi, ApiError } from "@/lib/api"
import type { Product, StockExit } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"

export default function EditarSaidaPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  const [products, setProducts] = useState<Product[]>([])
  const [exitRow, setExitRow] = useState<StockExit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError("Movimentacao invalida")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [p, x] = await Promise.all([
          listProductsApi(),
          getStockExitApi(id),
        ])
        if (!cancelled) {
          setProducts(p)
          setExitRow(x)
        }
      } catch (err) {
        if (!cancelled) {
          setExitRow(null)
          setError(
            err instanceof ApiError
              ? err.message
              : "Saida nao encontrada ou indisponivel."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Editar Saida" />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Spinner className="h-10 w-10" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : error || !exitRow ? (
          <div className="mx-auto max-w-md space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Saida nao encontrada."}</AlertDescription>
            </Alert>
            <Button variant="outline" asChild>
              <Link href="/movimentacoes">Voltar as movimentacoes</Link>
            </Button>
          </div>
        ) : (
          <ExitForm
            key={exitRow.id}
            products={products}
            mode="edit"
            initialExit={exitRow}
          />
        )}
      </div>
    </div>
  )
}
