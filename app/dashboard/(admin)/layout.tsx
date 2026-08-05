"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const session = useAuthStore((s) => s.session)

  React.useEffect(() => {
    if (session && session.role !== "Administrator") {
      toast.error("You do not have permission to access this page.")
      router.replace("/dashboard/overview")
    }
  }, [session, router])

  if (!session || session.role !== "Administrator") return null

  return <>{children}</>
}
