"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { MovementsTable } from "@/components/movimentacoes/movements-table"
import { Button } from "@/components/ui/button"
import { listProductsApi, listStockEntriesApi, listStockExitsApi } from "@/lib/api"
import type { Product, StockEntry, StockExit } from "@/lib/types"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

export default function MovimentacoesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [exits, setExits] = useState<StockExit[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [p, e, x] = await Promise.all([
          listProductsApi(),
          listStockEntriesApi(),
          listStockExitsApi(),
        ])
        if (!cancelled) {
          setProducts(p)
          setEntries(e)
          setExits(x)
        }
      } catch {
        if (!cancelled) {
          setProducts([])
          setEntries([])
          setExits([])
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
        title="Movimentacoes"
        description="Registre entradas e saidas de estoque"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {entries.length + exits.length} movimentacao
              {entries.length + exits.length !== 1 ? "oes" : ""} registrada
              {entries.length + exits.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/movimentacoes/entrada">
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Nova Entrada
              </Link>
            </Button>
            <Button asChild>
              <Link href="/movimentacoes/saida">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Nova Saida
              </Link>
            </Button>
          </div>
        </div>

        <MovementsTable products={products} entries={entries} exits={exits} />
      </div>
    </div>
  )
}
