// Usuario
export type UserRole = "ADMIN" | "USER"
export type UserPermission = "CAN_DELETE_MANUAL_RECORDS"

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  permissions: UserPermission[]
  subscriptionActive: boolean
  subscriptionExpiresAt: string | null
  createdAt: string
}

/** Usuario retornado pela API (sem credencial) */
export type SessionUser = Omit<User, "passwordHash">

// Categoria
export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
}

/** Linha de simulacao de cotação (somente analise; nao altera estoque) */
export interface CotacaoLinha {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  /** Custo unitario simulado (ex.: preco medio de compra) */
  unitCost: number
  /** Preco de venda unitario simulado */
  unitSale: number
}

// Produto
export interface Product {
  id: string
  name: string
  sku: string
  categoryId: string
  purchasePrice: number // Preco medio de compra (calculado)
  salePrice: number // Preco de venda
  quantity: number // Quantidade em estoque
  minStock: number // Estoque minimo (alerta)
  totalInvested: number // Soma total investida
  totalQuantityPurchased: number // Total ja adquirido
  createdAt: string
  updatedAt: string
}

/** Registro de auditoria de edicao de movimentacao (preenchido pela API apos PATCH). */
export interface MovementEditRecord {
  id: string
  editedAt: string
  editedByUserId?: string
  editedByName?: string
  changes: Array<{
    field: string
    label: string
    previous: string | number | null
    next: string | number | null
  }>
}

// Entrada de Estoque (Compra)
export interface StockEntry {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  date: string
  notes?: string
  createdAt: string
  /** Historico de alteracoes (opcional; lista pode vir vazia no indice). */
  editHistory?: MovementEditRecord[]
}

// Saida de Estoque (Venda)
export interface StockExit {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  date: string
  notes?: string
  createdAt: string
  /** Historico de alteracoes (opcional; lista pode vir vazia no indice). */
  editHistory?: MovementEditRecord[]
}

// Custo Fixo
export interface FixedCost {
  id: string
  name: string
  value: number
  month: string // YYYY-MM
  createdAt: string
}

// Resumo Financeiro Mensal
export interface MonthlyFinancial {
  month: string
  revenue: number // Soma das vendas
  costOfGoods: number // Custo dos produtos vendidos (preco medio * qtd)
  purchases: number // Soma das compras
  fixedCosts: number // Custos fixos
  grossProfit: number // Receita - Custo dos produtos
  netProfit: number // Lucro bruto - Custos fixos
}

// Tipo para formularios
export interface ProductFormData {
  name: string
  sku: string
  categoryId: string
  salePrice: number
  minStock: number
}

export interface StockEntryFormData {
  productId: string
  quantity: number
  unitPrice: number
  date: string
  notes?: string
}

export interface StockExitFormData {
  productId: string
  quantity: number
  unitPrice: number
  date: string
  notes?: string
}

export interface FixedCostFormData {
  name: string
  value: number
  month: string
}

export interface CategoryFormData {
  name: string
  description?: string
}

// Auth
export interface AuthState {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthResult {
  success: boolean
  user?: SessionUser
  error?: string
}

export interface AdminMetrics {
  totalUsers: number
  adminUsers: number
  activeSubscriptions: number
  inactiveOrExpiredSubscriptions: number
  subscriptionsExpiringIn7Days: number
  newUsersThisMonth: number
  newUsersPreviousMonth: number
}

export interface AdminAuditLog {
  id: string
  actorId: string
  actorName: string
  targetUserId: string
  targetUserName: string
  targetUserEmail: string
  changes: Array<{
    field: string
    previous: string | boolean | null
    next: string | boolean | null
  }>
  createdAt: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}
