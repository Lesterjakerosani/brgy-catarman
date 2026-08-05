"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { DashboardShell } from "@/components/dashboard/shell"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { ThemeColorSync } from "@/components/dashboard/theme-color-sync"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (hydrated && !session) {
      router.replace("/login")
    }
  }, [hydrated, session, router])

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30">
        <BarangaySeal className="size-14 animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <>
      <ThemeColorSync />
      <DashboardShell role={session.role}>{children}</DashboardShell>
    </>
  )
}
