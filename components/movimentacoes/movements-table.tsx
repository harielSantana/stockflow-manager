"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { Product, StockEntry, StockExit } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  MoreHorizontal,
  Pencil,
  History,
} from "lucide-react"
import { formatMonth, getLastMonths } from "@/lib/calculations"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MovementHistoryDialog } from "@/components/movimentacoes/movement-history-dialog"

interface MovementsTableProps {
  entries: StockEntry[]
  exits: StockExit[]
  products: Product[]
}

type Movement = {
  id: string
  type: "entry" | "exit"
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  date: string
  notes?: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

export function MovementsTable({
  entries,
  exits,
  products,
}: MovementsTableProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [historyTarget, setHistoryTarget] = useState<{
    type: "entry" | "exit"
    id: string
  } | null>(null)

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.name || "Produto removido"
  }

  const months = useMemo(() => getLastMonths(12), [])

  const movements = useMemo(() => {
    const entryMovements: Movement[] = entries.map((e) => ({
      id: e.id,
      type: "entry" as const,
      productId: e.productId,
      productName: getProductName(e.productId),
      quantity: e.quantity,
      unitPrice: e.unitPrice,
      totalPrice: e.totalPrice,
      date: e.date,
      notes: e.notes,
    }))

    const exitMovements: Movement[] = exits.map((e) => ({
      id: e.id,
      type: "exit" as const,
      productId: e.productId,
      productName: getProductName(e.productId),
      quantity: e.quantity,
      unitPrice: e.unitPrice,
      totalPrice: e.totalPrice,
      date: e.date,
      notes: e.notes,
    }))

    return [...entryMovements, ...exitMovements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [entries, exits, products])

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      // Search filter
      if (search.trim()) {
        const searchLower = search.toLowerCase()
        if (
          !movement.productName.toLowerCase().includes(searchLower) &&
          !movement.notes?.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Type filter
      if (typeFilter !== "all" && movement.type !== typeFilter) {
        return false
      }

      // Month filter
      if (monthFilter !== "all" && !movement.date.startsWith(monthFilter)) {
        return false
      }

      return true
    })
  }, [movements, search, typeFilter, monthFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar movimentacoes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="entry">Entradas</SelectItem>
            <SelectItem value="exit">Saidas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonth(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Preco Unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Obs.</TableHead>
              <TableHead className="w-[56px] text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhuma movimentacao encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((movement) => (
                <TableRow key={`${movement.type}-${movement.id}`}>
                  <TableCell>
                    {movement.type === "entry" ? (
                      <Badge
                        variant="outline"
                        className="flex w-fit items-center gap-1 border-emerald-500 text-emerald-500"
                      >
                        <ArrowDownCircle className="h-3 w-3" />
                        Entrada
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex w-fit items-center gap-1 border-blue-500 text-blue-500"
                      >
                        <ArrowUpCircle className="h-3 w-3" />
                        Saida
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(movement.date)}</TableCell>
                  <TableCell className="font-medium">
                    {movement.productName}
                  </TableCell>
                  <TableCell className="text-right">{movement.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(movement.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(movement.totalPrice)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {movement.notes || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Acoes da movimentacao"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={
                              movement.type === "entry"
                                ? `/movimentacoes/entrada/${movement.id}`
                                : `/movimentacoes/saida/${movement.id}`
                            }
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex cursor-pointer items-center gap-2"
                          onSelect={() =>
                            setHistoryTarget({
                              type: movement.type,
                              id: movement.id,
                            })
                          }
                        >
                          <History className="h-4 w-4" />
                          Historico
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MovementHistoryDialog
        target={historyTarget}
        onOpenChange={(open) => {
          if (!open) setHistoryTarget(null)
        }}
      />
    </div>
  )
}
