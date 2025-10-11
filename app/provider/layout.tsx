"use client"

import type React from "react"

import { useRequireAuth } from "@/hooks/useRequireAuth"
import { ProviderSidebar } from "@/components/layout/ProviderSidebar"

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireAuth({ roles: ["provider"] })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <ProviderSidebar />
      </aside>
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  )
}
