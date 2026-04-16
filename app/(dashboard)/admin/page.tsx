"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AdminDataState } from "@/components/admin/admin-data-state"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Header } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { listAdminMetricsApi } from "@/lib/api"
import type { AdminMetrics } from "@/lib/types"
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  KeyRound,
  ScrollText,
  Settings,
  ShieldAlert,
  UserPlus,
  Users,
  UserX,
} from "lucide-react"

const defaultMetrics: AdminMetrics = {
  totalUsers: 0,
  adminUsers: 0,
  activeSubscriptions: 0,
  inactiveOrExpiredSubscriptions: 0,
  subscriptionsExpiringIn7Days: 0,
  newUsersThisMonth: 0,
  newUsersPreviousMonth: 0,
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics>(defaultMetrics)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  const loadMetrics = async () => {
    try {
      setLoadingMetrics(true)
      const data = await listAdminMetricsApi()
      setMetrics(data)
      setMetricsError(null)
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : "Falha ao carregar metricas")
    } finally {
      setLoadingMetrics(false)
    }
  }

  useEffect(() => {
    void loadMetrics()
  }, [])

  const metricValues = useMemo(
    () => ({
      totalUsers: formatCount(metrics.totalUsers),
      adminUsers: formatCount(metrics.adminUsers),
      activeSubscriptions: formatCount(metrics.activeSubscriptions),
      inactiveOrExpiredSubscriptions: formatCount(metrics.inactiveOrExpiredSubscriptions),
      subscriptionsExpiringIn7Days: formatCount(metrics.subscriptionsExpiringIn7Days),
      newUsersThisMonth: formatCount(metrics.newUsersThisMonth),
      newUsersPreviousMonth: formatCount(metrics.newUsersPreviousMonth),
    }),
    [metrics]
  )

  const monthlyGrowth = metrics.newUsersThisMonth - metrics.newUsersPreviousMonth
  const growthTrend = monthlyGrowth === 0 ? "neutral" : monthlyGrowth > 0 ? "up" : "down"

  const quickLinks = [
    {
      title: "Gestao de usuarios",
      description: "Ajuste papeis, permissoes e assinatura de cada conta.",
      href: "/admin/usuarios",
      icon: Users,
    },
    {
      title: "Assinaturas",
      description: "Visualize saude das assinaturas e bloqueios.",
      href: "/admin/assinaturas",
      icon: CreditCard,
    },
    {
      title: "Permissoes",
      description: "Defina politicas por perfil para recursos sensiveis.",
      href: "/admin/permissoes",
      icon: KeyRound,
    },
    {
      title: "Logs administrativos",
      description: "Consulte historico de alteracoes criticas no sistema.",
      href: "/admin/logs",
      icon: ScrollText,
    },
    {
      title: "Configuracoes",
      description: "Organize preferencias para escalar a operacao admin.",
      href: "/admin/configuracoes",
      icon: Settings,
    },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Painel Administrativo"
        description="Visao executiva para operacao, governanca e crescimento do produto"
      />

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-6">
          <AdminPageHeader
            title="Resumo executivo"
            description="Monitore saude de assinaturas, crescimento de base e governanca de acesso."
            actions={
              <Button variant="outline" onClick={() => void loadMetrics()} disabled={loadingMetrics}>
                Atualizar metricas
              </Button>
            }
          />

          {loadingMetrics ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="space-y-2 pb-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : metricsError ? (
            <AdminDataState
              mode="error"
              title="Nao foi possivel carregar as metricas"
              description={metricsError}
              actionLabel="Tentar novamente"
              onAction={() => void loadMetrics()}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                title="Total de usuarios"
                value={metricValues.totalUsers}
                description="contas cadastradas"
                icon={Users}
              />
              <MetricCard
                title="Administradores"
                value={metricValues.adminUsers}
                description="usuarios com perfil administrativo"
                icon={ShieldAlert}
              />
              <MetricCard
                title="Assinaturas ativas"
                value={metricValues.activeSubscriptions}
                description="acesso liberado"
                icon={BadgeCheck}
                trend={metrics.activeSubscriptions > 0 ? "up" : "neutral"}
              />
              <MetricCard
                title="Inativas ou expiradas"
                value={metricValues.inactiveOrExpiredSubscriptions}
                description="contas bloqueadas"
                icon={UserX}
                trend={metrics.inactiveOrExpiredSubscriptions > 0 ? "down" : "neutral"}
              />
              <MetricCard
                title="Expiram em 7 dias"
                value={metricValues.subscriptionsExpiringIn7Days}
                description="assinaturas para acao preventiva"
                icon={CreditCard}
                trend={metrics.subscriptionsExpiringIn7Days > 0 ? "down" : "neutral"}
              />
              <MetricCard
                title="Novos no mes"
                value={metricValues.newUsersThisMonth}
                description="comparado ao mes anterior"
                icon={UserPlus}
                trend={growthTrend}
                trendValue={monthlyGrowth === 0 ? "0" : String(monthlyGrowth)}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Modulos administrativos</CardTitle>
              <CardDescription>
                Navegue pelos modulos para operar o produto com fluxo profissional.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-lg border bg-background p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <item.icon className="h-5 w-5 text-primary" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
