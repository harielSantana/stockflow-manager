"use client"

import { AdminComingSoonCard } from "@/components/admin/admin-coming-soon-card"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminConfiguracoesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Configuracoes Administrativas"
        description="Preferencias para escalar processos da operacao admin"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-4">
          <AdminPageHeader
            title="Configuracoes de operacao"
            description="Estrutura para centralizar politicas administrativas e padroes de governanca."
          />

          <Card>
            <CardHeader>
              <CardTitle>Checklist de readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Padrao de resposta para erros e loading nas telas administrativas.</p>
              <p>Fluxo consistente de toasts para alteracoes de usuario.</p>
              <p>Navegacao modular para novas capacidades sem refatoracao estrutural.</p>
            </CardContent>
          </Card>

          <AdminComingSoonCard
            title="Proximas configuracoes"
            description="Itens planejados para tornar o admin configuravel como produto."
            items={[
              "Preferencias de notificacao para eventos criticos",
              "Configuracao de niveis de severidade de alerta",
              "Parametros de retencao para trilha de auditoria",
            ]}
          />
        </div>
      </div>
    </div>
  )
}
