import type { Product, StockEntry, StockExit } from "@/lib/types"

/** Estoque disponível para uma nova saída ao editar uma saída existente (reverte o efeito da movimentação original no cliente). */
export function maxQuantityForExitEdit(
  product: Product | undefined,
  original: StockExit,
  selectedProductId: string
): number {
  if (!product) return 0
  if (selectedProductId === original.productId) {
    return product.quantity + original.quantity
  }
  return product.quantity
}

/** Valida se a edição de saída não deixaria estoque negativo no produto alvo (visão local com lista atual de produtos). */
export function validateExitEdit(
  products: Product[],
  original: StockExit,
  nextProductId: string,
  nextQuantity: number
): { ok: true } | { ok: false; message: string } {
  const product = products.find((p) => p.id === nextProductId)
  if (!product) {
    return { ok: false, message: "Produto nao encontrado" }
  }
  const max = maxQuantityForExitEdit(product, original, nextProductId)
  if (nextQuantity > max) {
    return {
      ok: false,
      message: `Estoque insuficiente para esta correcao. Disponivel: ${max} unidade(s) (considerando a reversao desta saida).`,
    }
  }
  return { ok: true }
}

/** Garante que, ao trocar o produto numa entrada, o estoque do produto antigo ainda cobre a reversão. */
export function validateEntryEdit(
  products: Product[],
  original: StockEntry,
  nextProductId: string,
  nextQuantity: number
): { ok: true } | { ok: false; message: string } {
  if (nextQuantity <= 0) {
    return { ok: false, message: "Quantidade invalida" }
  }
  if (nextProductId === original.productId) {
    const product = products.find((p) => p.id === nextProductId)
    if (!product) {
      return { ok: false, message: "Produto nao encontrado" }
    }
    const withoutThisEntry = product.quantity - original.quantity
    if (withoutThisEntry + nextQuantity < 0) {
      return {
        ok: false,
        message:
          "A alteracao resultaria em estoque negativo para este produto apos recalcular a entrada.",
      }
    }
    return { ok: true }
  }
  const oldProduct = products.find((p) => p.id === original.productId)
  if (oldProduct && oldProduct.quantity < original.quantity) {
    return {
      ok: false,
      message:
        "Nao e possivel alterar o produto: estoque atual do item original e inconsistente com a quantidade desta entrada.",
    }
  }
  return { ok: true }
}
