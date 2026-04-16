import { apiRequest } from "./client"
import { BFF_AUTH_PATHS } from "./routes"

export { ApiError } from "./client"
export { BFF_AUTH_PATHS } from "./routes"
import type {
  AdminAuditLog,
  AdminMetrics,
  Category,
  FixedCost,
  Product,
  UserPermission,
  UserRole,
  SessionUser,
  StockEntry,
  StockExit,
} from "@/lib/types"

export type AuthPayload = {
  user: SessionUser
}

export async function registerApi(body: {
  name: string
  email: string
  password: string
}): Promise<AuthPayload> {
  return apiRequest<AuthPayload>(BFF_AUTH_PATHS.register, {
    method: "POST",
    body,
  })
}

export async function loginApi(body: {
  email: string
  password: string
}): Promise<AuthPayload> {
  return apiRequest<AuthPayload>(BFF_AUTH_PATHS.login, {
    method: "POST",
    body,
  })
}

export async function logoutApi(): Promise<void> {
  try {
    await apiRequest<Record<string, never>>(BFF_AUTH_PATHS.logout, {
      method: "POST",
    })
  } catch {
    // Sessao stateless: ignorar falha de rede
  }
}

export async function getMeApi(): Promise<SessionUser> {
  return apiRequest<SessionUser>(BFF_AUTH_PATHS.me, { method: "GET" })
}

export async function listCategoriesApi(): Promise<Category[]> {
  return apiRequest<Category[]>("/categories", { method: "GET" })
}

export async function createCategoryApi(body: {
  name: string
  description?: string
}): Promise<Category> {
  return apiRequest<Category>("/categories", { method: "POST", body })
}

export async function updateCategoryApi(
  id: string,
  body: { name?: string; description?: string }
): Promise<Category> {
  return apiRequest<Category>(`/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  })
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiRequest<unknown>(`/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function listProductsApi(): Promise<Product[]> {
  return apiRequest<Product[]>("/products", { method: "GET" })
}

export async function getProductApi(id: string): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`, {
    method: "GET",
  })
}

export async function createProductApi(body: {
  name: string
  sku: string
  categoryId: string
  salePrice: number
  minStock: number
}): Promise<Product> {
  return apiRequest<Product>("/products", { method: "POST", body })
}

export async function updateProductApi(
  id: string,
  body: {
    name?: string
    sku?: string
    categoryId?: string
    salePrice?: number
    minStock?: number
  }
): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  })
}

export async function deleteProductApi(id: string): Promise<void> {
  await apiRequest<unknown>(`/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function listStockEntriesApi(month?: string): Promise<StockEntry[]> {
  const q = month ? `?month=${encodeURIComponent(month)}` : ""
  return apiRequest<StockEntry[]>(`/stock-entries${q}`, { method: "GET" })
}

export async function createStockEntryApi(body: {
  productId: string
  quantity: number
  unitPrice: number
  date: string
  notes?: string
}): Promise<StockEntry> {
  return apiRequest<StockEntry>("/stock-entries", { method: "POST", body })
}

export async function getStockEntryApi(id: string): Promise<StockEntry> {
  return apiRequest<StockEntry>(
    `/stock-entries/${encodeURIComponent(id)}`,
    { method: "GET" }
  )
}

export async function updateStockEntryApi(
  id: string,
  body: {
    productId?: string
    quantity?: number
    unitPrice?: number
    date?: string
    notes?: string | null
  }
): Promise<StockEntry> {
  return apiRequest<StockEntry>(
    `/stock-entries/${encodeURIComponent(id)}`,
    { method: "PATCH", body }
  )
}

export async function listStockExitsApi(month?: string): Promise<StockExit[]> {
  const q = month ? `?month=${encodeURIComponent(month)}` : ""
  return apiRequest<StockExit[]>(`/stock-exits${q}`, { method: "GET" })
}

export async function createStockExitApi(body: {
  productId: string
  quantity: number
  unitPrice: number
  date: string
  notes?: string
}): Promise<StockExit> {
  return apiRequest<StockExit>("/stock-exits", { method: "POST", body })
}

export async function getStockExitApi(id: string): Promise<StockExit> {
  return apiRequest<StockExit>(`/stock-exits/${encodeURIComponent(id)}`, {
    method: "GET",
  })
}

export async function updateStockExitApi(
  id: string,
  body: {
    productId?: string
    quantity?: number
    unitPrice?: number
    date?: string
    notes?: string | null
  }
): Promise<StockExit> {
  return apiRequest<StockExit>(`/stock-exits/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  })
}

export async function listFixedCostsApi(month?: string): Promise<FixedCost[]> {
  const q = month ? `?month=${encodeURIComponent(month)}` : ""
  return apiRequest<FixedCost[]>(`/fixed-costs${q}`, { method: "GET" })
}

export async function createFixedCostApi(body: {
  name: string
  value: number
  month: string
}): Promise<FixedCost> {
  return apiRequest<FixedCost>("/fixed-costs", { method: "POST", body })
}

export async function updateFixedCostApi(
  id: string,
  body: { name?: string; value?: number; month?: string }
): Promise<FixedCost> {
  return apiRequest<FixedCost>(`/fixed-costs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  })
}

export async function deleteFixedCostApi(id: string): Promise<void> {
  await apiRequest<unknown>(`/fixed-costs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export type BackupPayload = {
  users?: unknown[]
  categories: Category[]
  products: Product[]
  stockEntries: StockEntry[]
  stockExits: StockExit[]
  fixedCosts: FixedCost[]
  exportedAt: string
}

export async function exportBackupApi(): Promise<BackupPayload> {
  return apiRequest<BackupPayload>("/export/backup", { method: "GET" })
}

export async function listAdminUsersApi(): Promise<SessionUser[]> {
  return apiRequest<SessionUser[]>("/admin/users", { method: "GET" })
}

export async function listAdminMetricsApi(): Promise<AdminMetrics> {
  return apiRequest<AdminMetrics>("/admin/metrics", { method: "GET" })
}

export async function listAdminAuditLogsApi(): Promise<AdminAuditLog[]> {
  return apiRequest<AdminAuditLog[]>("/admin/audit-logs", { method: "GET" })
}

export async function updateAdminUserApi(
  id: string,
  body: {
    role?: UserRole
    permissions?: UserPermission[]
    subscriptionActive?: boolean
    subscriptionExpiresAt?: string | null
  }
): Promise<SessionUser> {
  return apiRequest<SessionUser>(`/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  })
}
