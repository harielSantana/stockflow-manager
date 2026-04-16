import { AuthProvider } from "@/components/auth/auth-provider"
import { AuthGuard } from "@/components/auth/auth-guard"
import { SubscriptionGuard } from "@/components/auth/subscription-guard"
import { AdminRouteGuard } from "@/components/auth/admin-route-guard"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AdminRouteGuard>
          <SubscriptionGuard>
            <div className="flex h-screen overflow-hidden bg-background">
              <Sidebar />
              <main className="flex flex-1 flex-col overflow-hidden">
                {children}
              </main>
            </div>
          </SubscriptionGuard>
        </AdminRouteGuard>
      </AuthGuard>
    </AuthProvider>
  )
}
