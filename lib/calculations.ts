import type { Product, StockEntry, StockExit, FixedCost, MonthlyFinancial } from "./types"

export type FinancialData = {
  products: Product[]
  entries: StockEntry[]
  exits: StockExit[]
  fixedCosts: FixedCost[]
}

function productById(products: Product[], id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function calculateTotalStockValue(products: Product[]): number {
  return products.reduce((total, product) => {
    return total + product.quantity * product.purchasePrice
  }, 0)
}

export function calculateTotalStockSaleValue(products: Product[]): number {
  return products.reduce((total, product) => {
    return total + product.quantity * product.salePrice
  }, 0)
}

export function calculatePotentialProfit(products: Product[]): number {
  return products.reduce((total, product) => {
    const profit = (product.salePrice - product.purchasePrice) * product.quantity
    return total + profit
  }, 0)
}

export function calculateMonthlyFinancial(
  month: string,
  data: FinancialData
): MonthlyFinancial {
  const entries = data.entries.filter((e) => e.date.startsWith(month))
  const exits = data.exits.filter((e) => e.date.startsWith(month))
  const fixedCosts = data.fixedCosts.filter((c) => c.month === month)

  const purchases = entries.reduce((sum, entry) => sum + entry.totalPrice, 0)
  const revenue = exits.reduce((sum, exit) => sum + exit.totalPrice, 0)

  const costOfGoods = exits.reduce((sum, exit) => {
    const product = productById(data.products, exit.productId)
    if (!product) return sum
    return sum + product.purchasePrice * exit.quantity
  }, 0)

  const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.value, 0)
  const grossProfit = revenue - costOfGoods
  const netProfit = grossProfit - totalFixedCosts

  return {
    month,
    revenue,
    costOfGoods,
    purchases,
    fixedCosts: totalFixedCosts,
    grossProfit,
    netProfit,
  }
}

export function calculateFinancialHistory(
  months: string[],
  data: FinancialData
): MonthlyFinancial[] {
  return months.map((month) => calculateMonthlyFinancial(month, data))
}

export function getLastMonths(count: number): string[] {
  const months: string[] = []
  const today = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    months.push(month)
  }

  return months.reverse()
}

export function formatMonth(month: string): string {
  const [year, monthNum] = month.split("-")
  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]
  return `${monthNames[parseInt(monthNum, 10) - 1]} ${year}`
}

export function getCurrentMonth(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter((product) => product.quantity <= product.minStock)
}

export function getOutOfStockProducts(products: Product[]): Product[] {
  return products.filter((product) => product.quantity === 0)
}

export function getTotalProductsCount(products: Product[]): number {
  return products.length
}

export function getMonthlyMovementsCount(
  month: string,
  entries: StockEntry[],
  exits: StockExit[]
): { entries: number; exits: number } {
  return {
    entries: entries.filter((e) => e.date.startsWith(month)).length,
    exits: exits.filter((e) => e.date.startsWith(month)).length,
  }
}

export function calculateAverageProfitMargin(products: Product[]): number {
  if (products.length === 0) return 0

  const totalMargin = products.reduce((sum, product) => {
    if (product.purchasePrice === 0) return sum
    const margin =
      ((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100
    return sum + margin
  }, 0)

  return totalMargin / products.length
}

export function getTopProductsByStockValue(
  products: Product[],
  limit: number = 5
): Product[] {
  return [...products]
    .sort(
      (a, b) =>
        b.quantity * b.purchasePrice - a.quantity * a.purchasePrice
    )
    .slice(0, limit)
}

export function getSalesByProduct(
  month: string,
  exits: StockExit[],
  products: Product[]
): { productId: string; productName: string; quantity: number; revenue: number }[] {
  const monthExits = exits.filter((e) => e.date.startsWith(month))
  const productSales: Record<string, { quantity: number; revenue: number }> = {}

  monthExits.forEach((exit) => {
    if (!productSales[exit.productId]) {
      productSales[exit.productId] = { quantity: 0, revenue: 0 }
    }
    productSales[exit.productId].quantity += exit.quantity
    productSales[exit.productId].revenue += exit.totalPrice
  })

  return Object.entries(productSales)
    .map(([productId, data]) => {
      const product = productById(products, productId)
      return {
        productId,
        productName: product?.name || "Produto removido",
        quantity: data.quantity,
        revenue: data.revenue,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
}
