"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Product, StockEntry } from "@/lib/types"
import { createStockEntryApi, updateStockEntryApi, ApiError } from "@/lib/api"
import { validateEntryEdit } from "@/lib/movement-edit-validation"
import { MovementEditHistory } from "@/components/movimentacoes/movement-edit-history"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, ArrowLeft, Package } from "lucide-react"

interface EntryFormProps {
  products: Product[]
  mode?: "create" | "edit"
  initialEntry?: StockEntry
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function entryDefaults(entry?: StockEntry) {
  if (!entry) {
    return {
      productId: "",
      quantity: "",
      unitPrice: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    }
  }
  const d = entry.date.length >= 10 ? entry.date.slice(0, 10) : entry.date
  return {
    productId: entry.productId,
    quantity: String(entry.quantity),
    unitPrice: String(entry.unitPrice),
    date: d,
    notes: entry.notes ?? "",
  }
}

export function EntryForm({
  products,
  mode = "create",
  initialEntry,
}: EntryFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit" && initialEntry
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState(() => entryDefaults(initialEntry))

  const selectedProduct = products.find((p) => p.id === formData.productId)

  const totalPrice =
    parseFloat(formData.quantity || "0") * parseFloat(formData.unitPrice || "0")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const quantity = parseInt(formData.quantity)
      const unitPrice = parseFloat(formData.unitPrice)

      if (isNaN(quantity) || quantity <= 0) {
        setError("Quantidade invalida")
        setIsLoading(false)
        return
      }

      if (isNaN(unitPrice) || unitPrice < 0) {
        setError("Preco unitario invalido")
        setIsLoading(false)
        return
      }

      if (!formData.productId) {
        setError("Selecione um produto")
        setIsLoading(false)
        return
      }

      if (isEdit && initialEntry) {
        if (!formData.notes.trim()) {
          setError(
            "Ao editar uma movimentacao, e obrigatorio preencher Observacoes com o motivo da alteracao (registro de auditoria)."
          )
          setIsLoading(false)
          return
        }
        const v = validateEntryEdit(
          products,
          initialEntry,
          formData.productId,
          quantity
        )
        if (!v.ok) {
          setError(v.message)
          setIsLoading(false)
          return
        }
        await updateStockEntryApi(initialEntry.id, {
          productId: formData.productId,
          quantity,
          unitPrice,
          date: formData.date,
          notes: formData.notes.trim() || null,
        })
      } else {
        await createStockEntryApi({
          productId: formData.productId,
          quantity,
          unitPrice,
          date: formData.date,
          notes: formData.notes.trim() || undefined,
        })
      }

      router.push("/movimentacoes")
    } catch (e) {
      if (e instanceof ApiError) {
        const raw = e.message
        const looksLikeNotesValidation =
          isEdit && /notes|observa[cç][aã]o/i.test(raw.toLowerCase())
        setError(
          looksLikeNotesValidation
            ? "A API exige uma observacao ao editar. Preencha o campo Observacoes explicando o motivo da correcao."
            : raw
        )
      } else {
        setError("Erro ao registrar entrada")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/movimentacoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-semibold">
          {isEdit ? "Editar Entrada de Estoque" : "Nova Entrada de Estoque"}
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dados da Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="product">Produto</FieldLabel>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, productId: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="quantity">Quantidade</FieldLabel>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="0"
                      required
                      disabled={isLoading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="unitPrice">Preco unitario (R$)</FieldLabel>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, unitPrice: e.target.value })
                      }
                      placeholder="0,00"
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="date">Data da entrada</FieldLabel>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="notes">
                    {isEdit
                      ? "Observacoes (obrigatorio na edicao)"
                      : "Observacoes (opcional)"}
                  </FieldLabel>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Ex: Compra do fornecedor X"
                    disabled={isLoading}
                    aria-required={Boolean(isEdit)}
                  />
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" asChild>
                  <Link href="/movimentacoes">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  {isEdit ? "Salvar alteracoes" : "Registrar Entrada"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-lg font-bold">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>

          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Produto Selecionado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estoque atual:</span>
                  <span className="font-medium">{selectedProduct.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preco medio:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedProduct.purchasePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total investido:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedProduct.totalInvested)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isEdit && initialEntry?.editHistory?.length ? (
        <div className="max-w-3xl">
          <MovementEditHistory records={initialEntry.editHistory} />
        </div>
      ) : null}
    </div>
  )
}
