"use client"

import Link from "next/link"
import { AdminComingSoonCard } from "@/components/admin/admin-coming-soon-card"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const permissionDomains = [
  "Estoque e ajustes manuais",
  "Financeiro e precificacao",
  "Exportacoes e backups",
  "Administracao de usuarios",
]

export default function AdminPermissoesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Permissoes"
        description="Governanca de acesso por perfil e capacidade sensivel"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-4">
          <AdminPageHeader
            title="Matriz de permissao"
            description="Padrao para transformar permissoes em produto com baixo risco operacional."
            actions={
              <Button variant="outline" asChild>
                <Link href="/admin/usuarios">Atualizar permissoes de usuarios</Link>
              </Button>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>Dominios de controle planejados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {permissionDomains.map((domain) => (
                <div key={domain} className="rounded-md border bg-background px-3 py-2 text-sm">
                  {domain}
                </div>
              ))}
            </CardContent>
          </Card>

          <AdminComingSoonCard
            title="Proximas entregas de autorizacao"
            description="A camada de papel e permissao ja existe e pode ser evoluida por modulo."
            items={[
              "Templates por perfil (operacional, financeiro, gestor)",
              "Permissoes granulares por acao critica",
              "Fluxo de aprovacao para mudancas sensiveis",
            ]}
          />
        </div>
      </div>
    </div>
  )
}
