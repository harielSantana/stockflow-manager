"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  listProductsApi,
  listCategoriesApi,
  listStockEntriesApi,
  listStockExitsApi,
  listFixedCostsApi,
} from "@/lib/api"
import {
  calculateTotalStockValue,
  calculateMonthlyFinancial,
  getCurrentMonth,
  getLowStockProducts,
  getLastMonths,
  calculateFinancialHistory,
  formatMonth,
} from "@/lib/calculations"
import type { Product, Category, FixedCost } from "@/lib/types"
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
  Wallet,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<Awaited<
    ReturnType<typeof listStockEntriesApi>
  >>([])
  const [exits, setExits] = useState<Awaited<
    ReturnType<typeof listStockExitsApi>
  >>([])
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [p, c, e, x, f] = await Promise.all([
          listProductsApi(),
          listCategoriesApi(),
          listStockEntriesApi(),
          listStockExitsApi(),
          listFixedCostsApi(),
        ])
        if (!cancelled) {
          setProducts(p)
          setCategories(c)
          setEntries(e)
          setExits(x)
          setFixedCosts(f)
          setLoadError(null)
        }
      } catch {
        if (!cancelled) setLoadError("Nao foi possivel carregar o dashboard.")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const financialData = useMemo(
    () => ({
      products,
      entries,
      exits,
      fixedCosts,
    }),
    [products, entries, exits, fixedCosts]
  )

  const monthlyData = useMemo(
    () =>
      calculateMonthlyFinancial(getCurrentMonth(), {
        products,
        entries,
        exits,
        fixedCosts,
      }),
    [products, entries, exits, fixedCosts]
  )

  const historyData = useMemo(
    () => calculateFinancialHistory(getLastMonths(6), financialData),
    [financialData]
  )

  const lowStockProducts = useMemo(
    () => getLowStockProducts(products),
    [products]
  )

  const stockValue = useMemo(
    () => calculateTotalStockValue(products),
    [products]
  )

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || "Sem categoria"
  }

  const chartData = useMemo(() => {
    return historyData.map((item) => ({
      month: formatMonth(item.month).split(" ")[0].slice(0, 3),
      receita: item.revenue,
      lucro: item.netProfit,
    }))
  }, [historyData])

  const totalProducts = products.length

  if (loadError) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Dashboard" description="Visao geral do seu negocio" />
        <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
          {loadError}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Dashboard"
        description="Visao geral do seu negocio"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Faturamento do Mes"
              value={formatCurrency(monthlyData?.revenue || 0)}
              description="receita em vendas"
              icon={DollarSign}
              trend={monthlyData && monthlyData.revenue > 0 ? "up" : "neutral"}
            />
            <MetricCard
              title="Lucro Liquido"
              value={formatCurrency(monthlyData?.netProfit || 0)}
              description="apos custos"
              icon={TrendingUp}
              trend={
                monthlyData
                  ? monthlyData.netProfit > 0
                    ? "up"
                    : monthlyData.netProfit < 0
                    ? "down"
                    : "neutral"
                  : "neutral"
              }
            />
            <MetricCard
              title="Valor em Estoque"
              value={formatCurrency(stockValue)}
              description={`${totalProducts} produtos`}
              icon={Package}
            />
            <MetricCard
              title="Alertas de Estoque"
              value={lowStockProducts.length.toString()}
              description="produtos com estoque baixo"
              icon={AlertTriangle}
              trend={lowStockProducts.length > 0 ? "down" : "neutral"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Evolucao Financeira</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/financeiro">
                    Ver detalhes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#888" />
                        <YAxis
                          stroke="#888"
                          tickFormatter={(value) =>
                            formatCurrency(value).replace("R$", "")
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Area
                          type="monotone"
                          dataKey="receita"
                          name="Receita"
                          stroke="#10b981"
                          fill="#10b98133"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="lucro"
                          name="Lucro"
                          stroke="#3b82f6"
                          fill="#3b82f633"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Nenhum dado disponivel
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Estoque Baixo</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/estoque">
                    Ver todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
                    <div>
                      <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>Todos os produtos com estoque adequado</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {getCategoryName(product.categoryId)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            product.quantity === 0 ? "destructive" : "secondary"
                          }
                        >
                          {product.quantity} un
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="text-sm">Receita total</span>
                    </div>
                    <span className="font-medium text-emerald-500">
                      {formatCurrency(monthlyData?.revenue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-sm">Compras (estoque)</span>
                    </div>
                    <span className="font-medium text-blue-500">
                      {formatCurrency(monthlyData?.purchases || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                        <Wallet className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="text-sm">Custos fixos</span>
                    </div>
                    <span className="font-medium text-red-500">
                      {formatCurrency(monthlyData?.fixedCosts || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Lucro liquido</span>
                    </div>
                    <span
                      className={`font-bold ${
                        (monthlyData?.netProfit || 0) >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatCurrency(monthlyData?.netProfit || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos Recentes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/estoque">
                    Ver todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
                    <div>
                      <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>Nenhum produto cadastrado</p>
                      <Button variant="link" asChild className="mt-2">
                        <Link href="/estoque/novo">Cadastrar produto</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.slice(0, 5).map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell className="text-right">
                              {product.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(product.salePrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
