"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/dashboard/header"
import { CashFlowSummary } from "@/components/financeiro/cash-flow-summary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  calculateMonthlyFinancial,
  calculateFinancialHistory,
  getCurrentMonth,
  formatMonth,
  getLastMonths,
  type FinancialData,
} from "@/lib/calculations"
import {
  listProductsApi,
  listStockEntriesApi,
  listStockExitsApi,
  listFixedCostsApi,
} from "@/lib/api"
import type { MonthlyFinancial } from "@/lib/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Settings } from "lucide-react"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function FinanceiroPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [financialCtx, setFinancialCtx] = useState<FinancialData | null>(null)

  const months = useMemo(() => getLastMonths(12), [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [products, entries, exits, fixedCosts] = await Promise.all([
          listProductsApi(),
          listStockEntriesApi(),
          listStockExitsApi(),
          listFixedCostsApi(),
        ])
        if (!cancelled) {
          setFinancialCtx({ products, entries, exits, fixedCosts })
        }
      } catch {
        if (!cancelled) setFinancialCtx(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const monthlyData = useMemo<MonthlyFinancial | null>(() => {
    if (!financialCtx) return null
    return calculateMonthlyFinancial(selectedMonth, financialCtx)
  }, [selectedMonth, financialCtx])

  const historyData = useMemo(() => {
    if (!financialCtx) return []
    return calculateFinancialHistory(getLastMonths(6), financialCtx)
  }, [financialCtx])

  const chartData = useMemo(() => {
    return historyData.map((item) => ({
      month: formatMonth(item.month).split(" ")[0].slice(0, 3),
      receita: item.revenue,
      custos: item.costOfGoods + item.fixedCosts,
      lucro: item.netProfit,
    }))
  }, [historyData])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Financeiro"
        description="Acompanhe o fluxo de caixa e lucros"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link href="/financeiro/custos">
              <Settings className="mr-2 h-4 w-4" />
              Gerenciar Custos Fixos
            </Link>
          </Button>
        </div>

        {monthlyData && (
          <div className="space-y-6">
            <CashFlowSummary data={monthlyData} />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Evolucao Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
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
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="receita"
                          name="Receita"
                          stroke="#10b981"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="custos"
                          name="Custos"
                          stroke="#ef4444"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="lucro"
                          name="Lucro"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comparativo Receita x Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
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
                        <Legend />
                        <Bar dataKey="receita" name="Receita" fill="#10b981" />
                        <Bar dataKey="custos" name="Custos" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
