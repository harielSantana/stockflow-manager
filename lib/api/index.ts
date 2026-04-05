export { ApiError, getApiToken, setApiToken, getApiBaseUrl } from "./client"
import { apiRequest } from "./client"
import type {
  Category,
  FixedCost,
  Product,
  SessionUser,
  StockEntry,
  StockExit,
} from "@/lib/types"

export type AuthPayload = {
  user: SessionUser
  accessToken: string
}

export async function registerApi(body: {
  name: string
  email: string
  password: string
}): Promise<AuthPayload> {
  return apiRequest<AuthPayload>("/auth/register", {
    method: "POST",
    body,
    auth: false,
  })
}

export async function loginApi(body: {
  email: string
  password: string
}): Promise<AuthPayload> {
  return apiRequest<AuthPayload>("/auth/login", {
    method: "POST",
    body,
    auth: false,
  })
}

export async function logoutApi(): Promise<void> {
  try {
    await apiRequest("/auth/logout", { method: "POST" })
  } catch {
    // Sessao stateless: ignorar falha de rede
  }
}

export async function getMeApi(): Promise<SessionUser> {
  return apiRequest<SessionUser>("/auth/me", { method: "GET" })
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
