"use client"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Header } from "@/components/dashboard/header"
import { UsersManagementCard } from "@/components/admin/users-management-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminUsuariosPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Administracao de Usuarios"
        description="Controle papeis, assinatura e permissoes do sistema"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-4">
          <AdminPageHeader
            title="Usuarios do sistema"
            description="Fluxo operacional para buscar, filtrar e atualizar acessos em poucos cliques."
            actions={
              <Button variant="outline" asChild>
                <Link href="/admin/logs">Ver logs administrativos</Link>
              </Button>
            }
          />
          <UsersManagementCard />
        </div>
      </div>
    </div>
  )
}
