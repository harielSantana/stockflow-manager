"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AdminComingSoonCard } from "@/components/admin/admin-coming-soon-card"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listAdminUsersApi } from "@/lib/api"
import type { SessionUser } from "@/lib/types"

function summarizeSubscriptions(users: SessionUser[]) {
  const now = Date.now()
  let active = 0
  let inactive = 0
  let expiringSoon = 0

  for (const user of users) {
    if (!user.subscriptionActive) {
      inactive += 1
      continue
    }
    if (!user.subscriptionExpiresAt) {
      active += 1
      continue
    }
    const expiresAt = new Date(user.subscriptionExpiresAt).getTime()
    if (expiresAt <= now) {
      inactive += 1
      continue
    }
    active += 1
    const inSevenDays = now + 7 * 24 * 60 * 60 * 1000
    if (expiresAt <= inSevenDays) expiringSoon += 1
  }

  return { active, inactive, expiringSoon }
}

export default function AdminAssinaturasPage() {
  const [users, setUsers] = useState<SessionUser[]>([])

  useEffect(() => {
    void listAdminUsersApi().then(setUsers).catch(() => undefined)
  }, [])

  const summary = useMemo(() => summarizeSubscriptions(users), [users])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Assinaturas"
        description="Visao de saude e retencao de assinaturas do produto"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-4">
          <AdminPageHeader
            title="Operacao de assinaturas"
            description="Base para evoluir para um modulo completo de billing e retencao."
            actions={
              <Button variant="outline" asChild>
                <Link href="/admin/usuarios">Gerenciar usuarios</Link>
              </Button>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ativas</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{summary.active}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inativas/expiradas</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{summary.inactive}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vencendo em 7 dias</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{summary.expiringSoon}</CardContent>
            </Card>
          </div>
          <AdminComingSoonCard
            title="Evolucao de billing"
            description="Este modulo ja nasce com dados operacionais e esta pronto para receber integracao de pagamento."
            items={[
              "Eventos de cobranca e webhook de pagamento",
              "Regras de periodo de graca e bloqueio progressivo",
              "Alertas automaticos para contas proximas do vencimento",
            ]}
          />
        </div>
      </div>
    </div>
  )
}
