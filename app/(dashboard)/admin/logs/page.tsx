"use client"

import { useEffect, useState } from "react"
import { AdminDataState } from "@/components/admin/admin-data-state"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listAdminAuditLogsApi } from "@/lib/api"
import type { AdminAuditLog } from "@/lib/types"

function humanizeChangeField(field: string): string {
  if (field === "role") return "Papel"
  if (field === "permissions") return "Permissoes"
  if (field === "subscriptionActive") return "Assinatura ativa"
  if (field === "subscriptionExpiresAt") return "Expiracao da assinatura"
  return field
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await listAdminAuditLogsApi()
      setLogs(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLogs()
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Logs Administrativos"
        description="Trilha operacional das alteracoes mais recentes"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-4">
          <AdminPageHeader
            title="Auditoria de alteracoes"
            description="Registros recentes de mudancas administrativas (mantidos em memoria no servidor)."
            actions={
              <Button variant="outline" onClick={() => void loadLogs()} disabled={loading}>
                Atualizar logs
              </Button>
            }
          />

          {loading ? (
            <AdminDataState mode="loading" />
          ) : error ? (
            <AdminDataState
              mode="error"
              description={error}
              actionLabel="Tentar novamente"
              onAction={() => void loadLogs()}
            />
          ) : logs.length === 0 ? (
            <AdminDataState
              mode="empty"
              title="Sem eventos no momento"
              description="Quando um administrador alterar usuarios, os eventos aparecerao aqui."
            />
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base">
                        {log.actorName} alterou {log.targetUserName}
                      </CardTitle>
                      <Badge variant="outline">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.targetUserEmail}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {log.changes.map((change) => (
                      <div key={`${log.id}-${change.field}`} className="rounded-md border bg-background p-3">
                        <p className="text-xs font-medium">{humanizeChangeField(change.field)}</p>
                        <p className="text-xs text-muted-foreground">
                          De <strong>{String(change.previous ?? "null")}</strong> para{" "}
                          <strong>{String(change.next ?? "null")}</strong>
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
