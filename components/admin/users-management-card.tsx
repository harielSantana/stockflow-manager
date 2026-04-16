"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminActionCell } from "@/components/admin/admin-action-cell"
import { AdminDataState } from "@/components/admin/admin-data-state"
import { AdminFiltersBar } from "@/components/admin/admin-filters-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { Switch } from "@/components/ui/switch"
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
import { listAdminUsersApi, updateAdminUserApi } from "@/lib/api"
import type { SessionUser, UserRole } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

type UsersManagementCardProps = {
  title?: string
  onDataChanged?: () => void | Promise<void>
}

function roleLabel(role: UserRole): string {
  return role === "ADMIN" ? "Administrador" : "Usuario"
}

function subscriptionLabel(user: SessionUser): string {
  if (!user.subscriptionActive) return "Inativa"
  if (!user.subscriptionExpiresAt) return "Ativa"
  const expiresAt = new Date(user.subscriptionExpiresAt)
  if (expiresAt.getTime() <= Date.now()) return "Expirada"
  return "Ativa"
}

function toDateInputValue(value: string | null): string {
  if (!value) return ""
  return value.slice(0, 10)
}

function toSortableTimestamp(value: string | null): number {
  if (!value) return Number.POSITIVE_INFINITY
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed
}

type SortOption = "name-asc" | "name-desc" | "created-desc" | "expires-asc"
type SubscriptionFilter = "ALL" | "ACTIVE" | "INACTIVE" | "EXPIRED"
type PermissionFilter = "ALL" | "ALLOWED" | "BLOCKED"
type RoleFilter = "ALL" | UserRole

export function UsersManagementCard({
  title = "Usuarios cadastrados",
  onDataChanged,
}: UsersManagementCardProps) {
  const [users, setUsers] = useState<SessionUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL")
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>("ALL")
  const [permissionFilter, setPermissionFilter] = useState<PermissionFilter>("ALL")
  const [sortOption, setSortOption] = useState<SortOption>("created-desc")
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [expirationDrafts, setExpirationDrafts] = useState<Record<string, string>>({})

  const notifyDataChange = async () => {
    if (onDataChanged) {
      await onDataChanged()
    }
  }

  const setSaving = (userId: string, saving: boolean) => {
    setSavingIds((prev) => ({ ...prev, [userId]: saving }))
  }

  const isSaving = (userId: string) => savingIds[userId] === true

  const syncExpirationDrafts = (data: SessionUser[]) => {
    const nextDrafts: Record<string, string> = {}
    for (const user of data) {
      nextDrafts[user.id] = toDateInputValue(user.subscriptionExpiresAt)
    }
    setExpirationDrafts(nextDrafts)
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await listAdminUsersApi()
      setUsers(data)
      syncExpirationDrafts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar usuarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, roleFilter, subscriptionFilter, permissionFilter, sortOption, pageSize])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const result = users.filter((user) => {
      if (
        term &&
        !user.name.toLowerCase().includes(term) &&
        !user.email.toLowerCase().includes(term)
      ) {
        return false
      }

      if (roleFilter !== "ALL" && user.role !== roleFilter) {
        return false
      }

      if (subscriptionFilter !== "ALL") {
        const label = subscriptionLabel(user)
        if (subscriptionFilter === "ACTIVE" && label !== "Ativa") return false
        if (subscriptionFilter === "INACTIVE" && label !== "Inativa") return false
        if (subscriptionFilter === "EXPIRED" && label !== "Expirada") return false
      }

      const hasManualDeletePermission = user.permissions.includes("CAN_DELETE_MANUAL_RECORDS")
      if (permissionFilter === "ALLOWED" && !hasManualDeletePermission) return false
      if (permissionFilter === "BLOCKED" && hasManualDeletePermission) return false

      return true
    })

    result.sort((a, b) => {
      if (sortOption === "name-asc") return a.name.localeCompare(b.name, "pt-BR")
      if (sortOption === "name-desc") return b.name.localeCompare(a.name, "pt-BR")
      if (sortOption === "expires-asc") {
        return toSortableTimestamp(a.subscriptionExpiresAt) - toSortableTimestamp(b.subscriptionExpiresAt)
      }
      return Date.parse(b.createdAt) - Date.parse(a.createdAt)
    })

    return result
  }, [permissionFilter, roleFilter, searchTerm, sortOption, subscriptionFilter, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      setSaving(userId, true)
      const updated = await updateAdminUserApi(userId, { role })
      setUsers((prev) => prev.map((item) => (item.id === userId ? updated : item)))
      setExpirationDrafts((prev) => ({ ...prev, [userId]: toDateInputValue(updated.subscriptionExpiresAt) }))
      toast({
        title: "Papel atualizado",
        description: "A permissao de acesso do usuario foi atualizada.",
      })
      await notifyDataChange()
    } catch (err) {
      toast({
        title: "Falha ao atualizar papel",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setSaving(userId, false)
    }
  }

  const handleSubscriptionChange = async (userId: string, active: boolean) => {
    try {
      setSaving(userId, true)
      const updated = await updateAdminUserApi(userId, { subscriptionActive: active })
      setUsers((prev) => prev.map((item) => (item.id === userId ? updated : item)))
      setExpirationDrafts((prev) => ({ ...prev, [userId]: toDateInputValue(updated.subscriptionExpiresAt) }))
      toast({
        title: active ? "Assinatura ativada" : "Assinatura desativada",
        description: "Status atualizado com sucesso.",
      })
      await notifyDataChange()
    } catch (err) {
      toast({
        title: "Falha ao atualizar assinatura",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setSaving(userId, false)
    }
  }

  const handlePermissionChange = async (userId: string, enabled: boolean) => {
    try {
      setSaving(userId, true)
      const permissions = enabled ? (["CAN_DELETE_MANUAL_RECORDS"] as const) : []
      const updated = await updateAdminUserApi(userId, {
        permissions: [...permissions],
      })
      setUsers((prev) => prev.map((item) => (item.id === userId ? updated : item)))
      toast({
        title: "Permissao atualizada",
        description: enabled ? "Acao manual liberada para o usuario." : "Acao manual bloqueada para o usuario.",
      })
      await notifyDataChange()
    } catch (err) {
      toast({
        title: "Falha ao atualizar permissao",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setSaving(userId, false)
    }
  }

  const handleExpirationSave = async (user: SessionUser) => {
    const draft = expirationDrafts[user.id]
    if (!draft) {
      toast({
        title: "Defina uma data valida",
        description: "Escolha uma data para salvar a expiracao da assinatura.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(user.id, true)
      const isoDate = new Date(`${draft}T23:59:59.000Z`).toISOString()
      const updated = await updateAdminUserApi(user.id, { subscriptionExpiresAt: isoDate })
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
      setExpirationDrafts((prev) => ({ ...prev, [user.id]: toDateInputValue(updated.subscriptionExpiresAt) }))
      toast({
        title: "Expiracao atualizada",
        description: "A data de expiracao foi salva com sucesso.",
      })
      await notifyDataChange()
    } catch (err) {
      toast({
        title: "Falha ao salvar expiracao",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setSaving(user.id, false)
    }
  }

  const handleExpirationClear = async (userId: string) => {
    try {
      setSaving(userId, true)
      const updated = await updateAdminUserApi(userId, { subscriptionExpiresAt: null })
      setUsers((prev) => prev.map((item) => (item.id === userId ? updated : item)))
      setExpirationDrafts((prev) => ({ ...prev, [userId]: "" }))
      toast({
        title: "Expiracao removida",
        description: "A assinatura agora esta sem data limite.",
      })
      await notifyDataChange()
    } catch (err) {
      toast({
        title: "Falha ao remover expiracao",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setSaving(userId, false)
    }
  }

  const hasAnyFilter =
    searchTerm.trim().length > 0 ||
    roleFilter !== "ALL" ||
    subscriptionFilter !== "ALL" ||
    permissionFilter !== "ALL"

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>{title}</CardTitle>
        <AdminFiltersBar>
          <Input
            placeholder="Buscar por nome ou email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os papeis</SelectItem>
              <SelectItem value="ADMIN">{roleLabel("ADMIN")}</SelectItem>
              <SelectItem value="USER">{roleLabel("USER")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={subscriptionFilter}
            onValueChange={(value) => setSubscriptionFilter(value as SubscriptionFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por assinatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas assinaturas</SelectItem>
              <SelectItem value="ACTIVE">Ativas</SelectItem>
              <SelectItem value="INACTIVE">Inativas</SelectItem>
              <SelectItem value="EXPIRED">Expiradas</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={permissionFilter}
            onValueChange={(value) => setPermissionFilter(value as PermissionFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por permissao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas permissoes</SelectItem>
              <SelectItem value="ALLOWED">Remocao manual permitida</SelectItem>
              <SelectItem value="BLOCKED">Remocao manual bloqueada</SelectItem>
            </SelectContent>
          </Select>
        </AdminFiltersBar>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-[230px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created-desc">Mais recentes</SelectItem>
              <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
              <SelectItem value="expires-asc">Expiracao mais proxima</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 por pagina</SelectItem>
              <SelectItem value="10">10 por pagina</SelectItem>
              <SelectItem value="20">20 por pagina</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void loadUsers()}>
            Atualizar
          </Button>
          {hasAnyFilter ? (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("")
                setRoleFilter("ALL")
                setSubscriptionFilter("ALL")
                setPermissionFilter("ALL")
              }}
            >
              Limpar filtros
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <AdminDataState mode="loading" />
        ) : error ? (
          <AdminDataState
            mode="error"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() => void loadUsers()}
          />
        ) : filteredUsers.length === 0 ? (
          <AdminDataState
            mode="empty"
            title="Nenhum usuario encontrado"
            description="Ajuste os filtros ou termos de busca para localizar usuarios."
          />
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead>Expiracao</TableHead>
                    <TableHead>Permissao remover manual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => {
                    const saving = isSaving(user.id)
                    const hasManualDeletePermission = user.permissions.includes(
                      "CAN_DELETE_MANUAL_RECORDS"
                    )
                    const draftExpiration = expirationDrafts[user.id] ?? ""

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <AdminActionCell isSaving={saving}>
                            <Select
                              value={user.role}
                              disabled={saving}
                              onValueChange={(value) =>
                                void handleRoleChange(user.id, value as UserRole)
                              }
                            >
                              <SelectTrigger className="w-[170px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USER">{roleLabel("USER")}</SelectItem>
                                <SelectItem value="ADMIN">{roleLabel("ADMIN")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </AdminActionCell>
                        </TableCell>
                        <TableCell>
                          <AdminActionCell isSaving={saving}>
                            <Switch
                              checked={user.subscriptionActive}
                              disabled={saving}
                              onCheckedChange={(checked) =>
                                void handleSubscriptionChange(user.id, checked)
                              }
                            />
                            <Badge variant={user.subscriptionActive ? "default" : "outline"}>
                              {subscriptionLabel(user)}
                            </Badge>
                          </AdminActionCell>
                        </TableCell>
                        <TableCell>
                          <AdminActionCell isSaving={saving} className="max-w-[260px]">
                            <Input
                              type="date"
                              value={draftExpiration}
                              disabled={saving}
                              onChange={(event) =>
                                setExpirationDrafts((prev) => ({
                                  ...prev,
                                  [user.id]: event.target.value,
                                }))
                              }
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={saving || draftExpiration.length === 0}
                              onClick={() => void handleExpirationSave(user)}
                            >
                              Salvar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={saving || user.subscriptionExpiresAt === null}
                              onClick={() => void handleExpirationClear(user.id)}
                            >
                              Limpar
                            </Button>
                          </AdminActionCell>
                        </TableCell>
                        <TableCell>
                          <AdminActionCell isSaving={saving}>
                            <Switch
                              checked={hasManualDeletePermission}
                              disabled={saving}
                              onCheckedChange={(checked) =>
                                void handlePermissionChange(user.id, checked)
                              }
                            />
                            <span className="text-xs text-muted-foreground">
                              {hasManualDeletePermission ? "Permitido" : "Bloqueado"}
                            </span>
                          </AdminActionCell>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios
              </p>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      size="default"
                      aria-disabled={currentPage <= 1}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                      onClick={(event) => {
                        event.preventDefault()
                        setPage((prev) => Math.max(1, prev - 1))
                      }}
                    >
                      Anterior
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive size="default">
                      {currentPage} / {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      size="default"
                      aria-disabled={currentPage >= totalPages}
                      className={
                        currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault()
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }}
                    >
                      Proxima
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
