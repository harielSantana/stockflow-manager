"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Spinner } from "@/components/ui/spinner"

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const isAdminPath = pathname.startsWith("/admin")
  const shouldRedirectUser = user?.role === "USER" && isAdminPath

  useEffect(() => {
    if (shouldRedirectUser) {
      router.replace("/")
    }
  }, [router, shouldRedirectUser])

  if (isLoading || shouldRedirectUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return <>{children}</>
}
