import type { CotacaoLinha } from "./types"

export type TotaisLinhaCotacao = {
  totalCost: number
  totalSale: number
  profit: number
  /** Margem sobre custo unitario; null se custo unitario for zero */
  marginPercent: number | null
}

export function calcularLinhaCotacao(linha: CotacaoLinha): TotaisLinhaCotacao {
  const totalCost = linha.quantity * linha.unitCost
  const totalSale = linha.quantity * linha.unitSale
  const profit = totalSale - totalCost
  const marginPercent =
    linha.unitCost > 0
      ? ((linha.unitSale - linha.unitCost) / linha.unitCost) * 100
      : null
  return { totalCost, totalSale, profit, marginPercent }
}

export type ResumoCotacao = {
  totalCost: number
  totalSale: number
  totalProfit: number
  /** Lucro total sobre custo total; null se custo total for zero */
  marginTotalPercent: number | null
}

export function calcularResumoCotacao(linhas: CotacaoLinha[]): ResumoCotacao {
  let totalCost = 0
  let totalSale = 0
  for (const linha of linhas) {
    const t = calcularLinhaCotacao(linha)
    totalCost += t.totalCost
    totalSale += t.totalSale
  }
  const totalProfit = totalSale - totalCost
  const marginTotalPercent =
    totalCost > 0 ? (totalProfit / totalCost) * 100 : null
  return { totalCost, totalSale, totalProfit, marginTotalPercent }
}
