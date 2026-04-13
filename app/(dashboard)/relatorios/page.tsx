"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { exportBackupApi } from "@/lib/api"
import { useDashboardDatasets } from "@/hooks/api/use-dashboard-datasets"
import {
  calculateFinancialHistory,
  getLastMonths,
  formatMonth,
  getSalesByProduct,
} from "@/lib/calculations"
import type {
  Product,
  Category,
  StockEntry,
  StockExit,
  FixedCost,
} from "@/lib/types"
import { Download, FileJson, FileSpreadsheet, Package, TrendingUp } from "lucide-react"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function RelatoriosPage() {
  const [selectedMonth, setSelectedMonth] = useState(getLastMonths(1)[0])
  const { products, categories, entries, exits, fixedCosts } =
    useDashboardDatasets()

  const months = useMemo(() => getLastMonths(12), [])

  const financialHistory = useMemo(
    () =>
      calculateFinancialHistory(getLastMonths(12), {
        products,
        entries,
        exits,
        fixedCosts,
      }),
    [products, entries, exits, fixedCosts]
  )

  const salesByProduct = useMemo(
    () => getSalesByProduct(selectedMonth, exits, products),
    [selectedMonth, exits, products]
  )

  const handleExportJSON = async () => {
    const data = await exportBackupApi()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gestao-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportProductsCSV = () => {
    const headers = [
      "Nome",
      "SKU",
      "Categoria",
      "Preco Medio",
      "Preco Venda",
      "Quantidade",
      "Estoque Minimo",
      "Total Investido",
    ]
    const rows = products.map((p) => {
      const category = categories.find((c) => c.id === p.categoryId)
      return [
        p.name,
        p.sku,
        category?.name || "",
        p.purchasePrice.toFixed(2),
        p.salePrice.toFixed(2),
        p.quantity.toString(),
        p.minStock.toString(),
        p.totalInvested.toFixed(2),
      ]
    })

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `produtos-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportFinancialCSV = () => {
    const headers = [
      "Mes",
      "Receita",
      "Custo Produtos",
      "Compras",
      "Custos Fixos",
      "Lucro Bruto",
      "Lucro Liquido",
    ]
    const rows = financialHistory.map((f) => [
      formatMonth(f.month),
      f.revenue.toFixed(2),
      f.costOfGoods.toFixed(2),
      f.purchases.toFixed(2),
      f.fixedCosts.toFixed(2),
      f.grossProfit.toFixed(2),
      f.netProfit.toFixed(2),
    ])

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `financeiro-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Relatorios"
        description="Exporte dados e visualize relatorios"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <Tabs defaultValue="export" className="space-y-6">
          <TabsList>
            <TabsTrigger value="export">Exportar Dados</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="sales">Vendas por Produto</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    Backup Completo
                  </CardTitle>
                  <CardDescription>
                    Exporta todos os dados em formato JSON para backup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleExportJSON} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar JSON
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Produtos
                  </CardTitle>
                  <CardDescription>
                    Lista de produtos em CSV para Excel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExportProductsCSV}
                    variant="outline"
                    className="w-full"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Financeiro
                  </CardTitle>
                  <CardDescription>
                    Relatorio financeiro mensal em CSV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExportFinancialCSV}
                    variant="outline"
                    className="w-full"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Estatisticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Total de Produtos
                    </p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Categorias</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Entradas</p>
                    <p className="text-2xl font-bold">{entries.length}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Saidas</p>
                    <p className="text-2xl font-bold">{exits.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Historico Financeiro</CardTitle>
                <CardDescription>Resumo financeiro dos ultimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mes</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                        <TableHead className="text-right">Custo Prod.</TableHead>
                        <TableHead className="text-right">Compras</TableHead>
                        <TableHead className="text-right">Custos Fixos</TableHead>
                        <TableHead className="text-right">Lucro Bruto</TableHead>
                        <TableHead className="text-right">Lucro Liquido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialHistory.map((item) => (
                        <TableRow key={item.month}>
                          <TableCell className="font-medium">
                            {formatMonth(item.month)}
                          </TableCell>
                          <TableCell className="text-right text-emerald-500">
                            {formatCurrency(item.revenue)}
                          </TableCell>
                          <TableCell className="text-right text-amber-500">
                            {formatCurrency(item.costOfGoods)}
                          </TableCell>
                          <TableCell className="text-right text-blue-500">
                            {formatCurrency(item.purchases)}
                          </TableCell>
                          <TableCell className="text-right text-red-500">
                            {formatCurrency(item.fixedCosts)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.grossProfit)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              item.netProfit >= 0 ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {formatCurrency(item.netProfit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vendas por Produto</CardTitle>
                  <CardDescription>Ranking de vendas no periodo</CardDescription>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
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
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd Vendida</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesByProduct.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            Nenhuma venda no periodo
                          </TableCell>
                        </TableRow>
                      ) : (
                        salesByProduct.map((item, index) => (
                          <TableRow key={item.productId}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right font-medium text-emerald-500">
                              {formatCurrency(item.revenue)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
