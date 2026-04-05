"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MonthlyFinancial } from "@/lib/types"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Wallet,
  Receipt,
} from "lucide-react"

interface CashFlowSummaryProps {
  data: MonthlyFinancial
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function CashFlowSummary({ data }: CashFlowSummaryProps) {
  const margin = useMemo(() => {
    if (data.revenue === 0) return 0
    return ((data.netProfit / data.revenue) * 100).toFixed(1)
  }, [data])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receita (Vendas)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">
            {formatCurrency(data.revenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de vendas no periodo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Custo dos Produtos
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">
            {formatCurrency(data.costOfGoods)}
          </div>
          <p className="text-xs text-muted-foreground">
            Custo medio dos itens vendidos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Compras (Estoque)
          </CardTitle>
          <Receipt className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">
            {formatCurrency(data.purchases)}
          </div>
          <p className="text-xs text-muted-foreground">
            Investimento em estoque
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Custos Fixos
          </CardTitle>
          <Wallet className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {formatCurrency(data.fixedCosts)}
          </div>
          <p className="text-xs text-muted-foreground">
            Despesas fixas do periodo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Lucro Bruto
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              data.grossProfit >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {formatCurrency(data.grossProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receita - Custo dos produtos
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Lucro Liquido</CardTitle>
          {data.netProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              data.netProfit >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {formatCurrency(data.netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            Margem: {margin}% sobre a receita
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
