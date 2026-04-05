import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="relative min-h-svh">
        <div className="absolute end-4 top-4 z-10">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </AuthProvider>
  )
}
