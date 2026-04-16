"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"

function hasActiveSubscription(active: boolean, expiresAt: string | null): boolean {
  if (!active) return false
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() > Date.now()
}

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return <>{children}</>
  if (user.role === "ADMIN") return <>{children}</>
  if (pathname.startsWith("/admin")) return <>{children}</>

  if (!hasActiveSubscription(user.subscriptionActive, user.subscriptionExpiresAt)) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Assinatura inativa</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu acesso as funcionalidades do sistema foi bloqueado ate a confirmacao do pagamento.
            Entre em contato com o administrador para liberar sua conta.
          </p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
