"use client"

import { useMemo, useState, useCallback } from "react"
import type { Product, CotacaoLinha } from "@/lib/types"
import {
  calcularLinhaCotacao,
  calcularResumoCotacao,
} from "@/lib/cotacao"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Info, Package } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function newLineId(): string {
  return `cot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function emptyLine(): CotacaoLinha {
  return {
    id: newLineId(),
    productId: "",
    productName: "",
    sku: "",
    quantity: 1,
    unitCost: 0,
    unitSale: 0,
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—"
  return `${value >= 0 ? "" : ""}${value.toFixed(1)}%`
}

interface CotacaoSimuladorProps {
  products: Product[]
}

export function CotacaoSimulador({ products }: CotacaoSimuladorProps) {
  const [linhas, setLinhas] = useState<CotacaoLinha[]>([])

  const resumo = useMemo(() => calcularResumoCotacao(linhas), [linhas])

  const addLinha = useCallback(() => {
    setLinhas((prev) => [...prev, emptyLine()])
  }, [])

  const removeLinha = useCallback((id: string) => {
    setLinhas((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const updateLinha = useCallback(
    (id: string, patch: Partial<CotacaoLinha>) => {
      setLinhas((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
      )
    },
    []
  )

  const onProductChange = useCallback(
    (linhaId: string, productId: string) => {
      const p = products.find((x) => x.id === productId)
      if (!p) {
        updateLinha(linhaId, {
          productId: "",
          productName: "",
          sku: "",
          unitCost: 0,
          unitSale: 0,
        })
        return
      }
      updateLinha(linhaId, {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        unitCost: p.purchasePrice,
        unitSale: p.salePrice,
      })
    },
    [products, updateLinha]
  )

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16 text-center">
        <Package className="h-10 w-10 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-medium">Nenhum produto disponivel</p>
          <p className="text-sm text-muted-foreground">
            Cadastre produtos no estoque para montar uma cotação.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/estoque/novo">Ir para novo produto</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Simulacao apenas</AlertTitle>
        <AlertDescription>
          Esta cotação nao altera estoque, movimentacoes nem valores reais do
          sistema. Ajuste custos e precos para analisar cenarios comerciais antes
          de registrar uma venda em Movimentacoes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custo total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(resumo.totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Venda total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-emerald-500">
              {formatCurrency(resumo.totalSale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                resumo.totalProfit > 0
                  ? "text-emerald-500"
                  : resumo.totalProfit < 0
                    ? "text-red-500"
                    : ""
              }`}
            >
              {formatCurrency(resumo.totalProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margem total
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <p className="text-2xl font-semibold tabular-nums">
              {formatPercent(resumo.marginTotalPercent)}
            </p>
            {resumo.marginTotalPercent !== null && (
              <Badge
                variant={
                  resumo.marginTotalPercent >= 0 ? "secondary" : "destructive"
                }
              >
                sobre custo
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle>Itens da cotação</CardTitle>
          <Button type="button" onClick={addLinha} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {linhas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum item adicionado. Clique em &quot;Adicionar item&quot; e
              escolha um produto para montar a simulacao.
            </p>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Produto</TableHead>
                    <TableHead className="min-w-[88px] text-right">Qtd</TableHead>
                    <TableHead className="min-w-[120px] text-right">
                      Custo unit.
                    </TableHead>
                    <TableHead className="min-w-[120px] text-right">
                      Venda unit.
                    </TableHead>
                    <TableHead className="min-w-[130px] text-right">
                      Lucro (linha)
                    </TableHead>
                    <TableHead className="min-w-[100px] text-right">
                      Margem %
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((linha) => {
                    const t = calcularLinhaCotacao(linha)
                    return (
                      <TableRow key={linha.id}>
                        <TableCell>
                          <Select
                            value={linha.productId || undefined}
                            onValueChange={(v) => onProductChange(linha.id, v)}
                          >
                            <SelectTrigger className="w-[min(280px,85vw)]">
                              <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}{" "}
                                  <span className="text-muted-foreground">
                                    ({p.sku})
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            className="text-right tabular-nums"
                            value={linha.quantity || ""}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10)
                              updateLinha(linha.id, {
                                quantity: Number.isFinite(v) && v > 0 ? v : 1,
                              })
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="text-right tabular-nums"
                            value={linha.unitCost || ""}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value)
                              updateLinha(linha.id, {
                                unitCost: Number.isFinite(v) && v >= 0 ? v : 0,
                              })
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="text-right tabular-nums"
                            value={linha.unitSale || ""}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value)
                              updateLinha(linha.id, {
                                unitSale: Number.isFinite(v) && v >= 0 ? v : 0,
                              })
                            }}
                          />
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium tabular-nums ${
                            t.profit > 0
                              ? "text-emerald-500"
                              : t.profit < 0
                                ? "text-red-500"
                                : ""
                          }`}
                        >
                          {formatCurrency(t.profit)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatPercent(t.marginPercent)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLinha(linha.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {linhas.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Lucro por linha: (preco de venda unitario - custo unitario) x
              quantidade. Margem %: lucro sobre o custo unitario. Margem total:
              lucro total sobre o custo total da cotação.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
