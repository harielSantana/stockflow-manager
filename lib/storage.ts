import type {
  User,
  Category,
  Product,
  StockEntry,
  StockExit,
  FixedCost,
} from "./types"

// Storage keys
const STORAGE_KEYS = {
  AUTH_USER: "gestao_auth_user",
  USERS: "gestao_users",
  PRODUCTS: "gestao_products",
  CATEGORIES: "gestao_categories",
  STOCK_ENTRIES: "gestao_stock_entries",
  STOCK_EXITS: "gestao_stock_exits",
  FIXED_COSTS: "gestao_fixed_costs",
} as const

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Auth User
export function getAuthUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.AUTH_USER, null)
}

export function setAuthUser(user: User | null): void {
  if (user) {
    setItem(STORAGE_KEYS.AUTH_USER, user)
  } else {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
    }
  }
}

// Users
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, [])
}

export function saveUser(user: User): void {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index >= 0) {
    users[index] = user
  } else {
    users.push(user)
  }
  setItem(STORAGE_KEYS.USERS, users)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

// Categories
export function getCategories(): Category[] {
  return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, [])
}

export function saveCategory(category: Category): void {
  const categories = getCategories()
  const index = categories.findIndex((c) => c.id === category.id)
  if (index >= 0) {
    categories[index] = category
  } else {
    categories.push(category)
  }
  setItem(STORAGE_KEYS.CATEGORIES, categories)
}

export function deleteCategory(id: string): void {
  const categories = getCategories().filter((c) => c.id !== id)
  setItem(STORAGE_KEYS.CATEGORIES, categories)
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find((c) => c.id === id)
}

// Products
export function getProducts(): Product[] {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, [])
}

export function saveProduct(product: Product): void {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === product.id)
  if (index >= 0) {
    products[index] = product
  } else {
    products.push(product)
  }
  setItem(STORAGE_KEYS.PRODUCTS, products)
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter((p) => p.id !== id)
  setItem(STORAGE_KEYS.PRODUCTS, products)
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

export function getProductsByCategoryId(categoryId: string): Product[] {
  return getProducts().filter((p) => p.categoryId === categoryId)
}

// Stock Entries
export function getStockEntries(): StockEntry[] {
  return getItem<StockEntry[]>(STORAGE_KEYS.STOCK_ENTRIES, [])
}

export function saveStockEntry(entry: StockEntry): void {
  const entries = getStockEntries()
  const index = entries.findIndex((e) => e.id === entry.id)
  if (index >= 0) {
    entries[index] = entry
  } else {
    entries.push(entry)
  }
  setItem(STORAGE_KEYS.STOCK_ENTRIES, entries)
}

export function deleteStockEntry(id: string): void {
  const entries = getStockEntries().filter((e) => e.id !== id)
  setItem(STORAGE_KEYS.STOCK_ENTRIES, entries)
}

export function getStockEntriesByProductId(productId: string): StockEntry[] {
  return getStockEntries().filter((e) => e.productId === productId)
}

export function getStockEntriesByMonth(month: string): StockEntry[] {
  return getStockEntries().filter((e) => e.date.startsWith(month))
}

// Stock Exits
export function getStockExits(): StockExit[] {
  return getItem<StockExit[]>(STORAGE_KEYS.STOCK_EXITS, [])
}

export function saveStockExit(exit: StockExit): void {
  const exits = getStockExits()
  const index = exits.findIndex((e) => e.id === exit.id)
  if (index >= 0) {
    exits[index] = exit
  } else {
    exits.push(exit)
  }
  setItem(STORAGE_KEYS.STOCK_EXITS, exits)
}

export function deleteStockExit(id: string): void {
  const exits = getStockExits().filter((e) => e.id !== id)
  setItem(STORAGE_KEYS.STOCK_EXITS, exits)
}

export function getStockExitsByProductId(productId: string): StockExit[] {
  return getStockExits().filter((e) => e.productId === productId)
}

export function getStockExitsByMonth(month: string): StockExit[] {
  return getStockExits().filter((e) => e.date.startsWith(month))
}

// Fixed Costs
export function getFixedCosts(): FixedCost[] {
  return getItem<FixedCost[]>(STORAGE_KEYS.FIXED_COSTS, [])
}

export function saveFixedCost(cost: FixedCost): void {
  const costs = getFixedCosts()
  const index = costs.findIndex((c) => c.id === cost.id)
  if (index >= 0) {
    costs[index] = cost
  } else {
    costs.push(cost)
  }
  setItem(STORAGE_KEYS.FIXED_COSTS, costs)
}

export function deleteFixedCost(id: string): void {
  const costs = getFixedCosts().filter((c) => c.id !== id)
  setItem(STORAGE_KEYS.FIXED_COSTS, costs)
}

export function getFixedCostsByMonth(month: string): FixedCost[] {
  return getFixedCosts().filter((c) => c.month === month)
}

// Export/Import all data
export function exportAllData(): string {
  const data = {
    users: getUsers(),
    categories: getCategories(),
    products: getProducts(),
    stockEntries: getStockEntries(),
    stockExits: getStockExits(),
    fixedCosts: getFixedCosts(),
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData)
    if (data.users) setItem(STORAGE_KEYS.USERS, data.users)
    if (data.categories) setItem(STORAGE_KEYS.CATEGORIES, data.categories)
    if (data.products) setItem(STORAGE_KEYS.PRODUCTS, data.products)
    if (data.stockEntries) setItem(STORAGE_KEYS.STOCK_ENTRIES, data.stockEntries)
    if (data.stockExits) setItem(STORAGE_KEYS.STOCK_EXITS, data.stockExits)
    if (data.fixedCosts) setItem(STORAGE_KEYS.FIXED_COSTS, data.fixedCosts)
    return true
  } catch {
    return false
  }
}

// Clear all data (useful for testing)
export function clearAllData(): void {
  if (typeof window === "undefined") return
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}
