"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./useAuth"

interface UseRequireAuthOptions {
  roles?: ("customer" | "provider" | "admin")[]
  redirectTo?: string
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { roles, redirectTo = "/login" } = options

  useEffect(() => {
    console.log("useRequireAuth check:", { isLoading, user, roles, redirectTo })
    if (!isLoading) {
      if (!user) {
        console.log("No user, redirecting to:", redirectTo)
        router.push(redirectTo)
      } else if (roles && !roles.includes(user.role)) {
        console.log("User role mismatch, user role:", user.role, "required roles:", roles)
        // Redirect to appropriate dashboard if wrong role
        if (user.role === "admin") {
          router.push("/admin")
        } else if (user.role === "provider") {
          router.push("/provider")
        } else {
          router.push("/")
        }
      } else {
        console.log("User authenticated and has correct role")
      }
    }
  }, [user, isLoading, roles, router, redirectTo])

  return { user, isLoading }
}
