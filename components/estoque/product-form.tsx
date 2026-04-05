"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product, Category } from "@/lib/types"
import { createProductApi, updateProductApi, ApiError } from "@/lib/api"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    categoryId: product?.categoryId || "",
    salePrice: product?.salePrice?.toString() || "",
    minStock: product?.minStock?.toString() || "5",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const salePrice = parseFloat(formData.salePrice)
      const minStock = parseInt(formData.minStock)

      if (isNaN(salePrice) || salePrice < 0) {
        setError("Preco de venda invalido")
        setIsLoading(false)
        return
      }

      if (isNaN(minStock) || minStock < 0) {
        setError("Estoque minimo invalido")
        setIsLoading(false)
        return
      }

      if (product) {
        await updateProductApi(product.id, {
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          categoryId: formData.categoryId,
          salePrice,
          minStock,
        })
      } else {
        await createProductApi({
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          categoryId: formData.categoryId,
          salePrice,
          minStock,
        })
      }
      router.push("/estoque")
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError("Erro ao salvar produto")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/estoque">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-semibold">
          {product ? "Editar Produto" : "Novo Produto"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacoes do Produto</CardTitle>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">Nome do produto</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: iPhone 15 Pro Max"
                    required
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="sku">SKU / Codigo</FieldLabel>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="Ex: IPH15PM-256"
                    required
                    disabled={isLoading}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="category">Categoria</FieldLabel>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="salePrice">Preco de venda (R$)</FieldLabel>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, salePrice: e.target.value })
                    }
                    placeholder="0,00"
                    required
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="minStock">Estoque minimo</FieldLabel>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: e.target.value })
                    }
                    placeholder="5"
                    required
                    disabled={isLoading}
                  />
                </Field>
              </div>

              {product && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Informacoes atuais</h4>
                  <div className="grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <span className="text-muted-foreground">Preco medio: </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(product.purchasePrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantidade: </span>
                      <span className="font-medium">{product.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total investido: </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(product.totalInvested)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </FieldGroup>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/estoque">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                {product ? "Salvar alteracoes" : "Cadastrar produto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
