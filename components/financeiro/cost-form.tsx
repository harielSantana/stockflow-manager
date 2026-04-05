"use client"

import { useState, useEffect } from "react"
import type { FixedCost } from "@/lib/types"
import {
  listFixedCostsApi,
  createFixedCostApi,
  updateFixedCostApi,
  deleteFixedCostApi,
} from "@/lib/api"
import { getCurrentMonth, formatMonth, getLastMonths } from "@/lib/calculations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface CostFormProps {
  onUpdate?: () => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function CostForm({ onUpdate }: CostFormProps) {
  const [costs, setCosts] = useState<FixedCost[]>([])
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [editCost, setEditCost] = useState<FixedCost | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    month: getCurrentMonth(),
  })

  const months = getLastMonths(12)

  const loadCosts = async () => {
    const list = await listFixedCostsApi()
    setCosts(list)
  }

  useEffect(() => {
    loadCosts().catch(() => setCosts([]))
  }, [])

  const filteredCosts = costs.filter((c) => c.month === selectedMonth)

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.value, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const value = parseFloat(formData.value)
    if (isNaN(value) || value < 0) return

    if (editCost) {
      await updateFixedCostApi(editCost.id, {
        name: formData.name.trim(),
        value,
        month: formData.month,
      })
    } else {
      await createFixedCostApi({
        name: formData.name.trim(),
        value,
        month: formData.month,
      })
    }
    setDialogOpen(false)
    setEditCost(null)
    setFormData({ name: "", value: "", month: getCurrentMonth() })
    await loadCosts()
    onUpdate?.()
  }

  const handleEdit = (cost: FixedCost) => {
    setEditCost(cost)
    setFormData({
      name: cost.name,
      value: cost.value.toString(),
      month: cost.month,
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFixedCostApi(deleteId)
      setDeleteId(null)
      await loadCosts()
      onUpdate?.()
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditCost(null)
    setFormData({ name: "", value: "", month: getCurrentMonth() })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Custos Fixos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie os custos fixos mensais
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Custo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editCost ? "Editar Custo" : "Novo Custo Fixo"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Descricao</FieldLabel>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Aluguel, Luz, Internet"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="value">Valor (R$)</FieldLabel>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      placeholder="0,00"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="month">Mes</FieldLabel>
                    <Select
                      value={formData.month}
                      onValueChange={(value) =>
                        setFormData({ ...formData, month: value })
                      }
                    >
                      <SelectTrigger id="month">
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
                  </Field>
                </FieldGroup>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">{editCost ? "Salvar" : "Criar"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhum custo fixo cadastrado para este mes
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(cost.value)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cost)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(cost.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(totalCosts)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este custo fixo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
