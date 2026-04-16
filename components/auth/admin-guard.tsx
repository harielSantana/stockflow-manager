"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Spinner } from "@/components/ui/spinner"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    if (user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router, user?.role])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  return <>{children}</>
}
