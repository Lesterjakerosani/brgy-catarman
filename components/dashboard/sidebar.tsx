"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { NAV_GROUPS } from "@/components/dashboard/nav-config"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { UserRole } from "@/types"
import { cn } from "@/lib/utils"

export function DashboardSidebar({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)

  function handleSignOut() {
    logout()
    toast.success("You have been logged out.")
    router.replace("/login")
  }

  return (
    <div className="flex h-full flex-col bg-card text-foreground">
      <div
        className="relative flex flex-col items-center gap-3 overflow-hidden px-5 py-6"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(#0F172A 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="group relative z-10">
          <div className="rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 p-[2px] shadow-md shadow-blue-900/10 transition-transform duration-300 ease-out group-hover:scale-105">
            <InitialsAvatar
              name={session?.name ?? "?"}
              photoUrl={session?.avatarUrl}
              size="lg"
              className="ring-2 ring-white"
            />
          </div>
        </div>
        <div className="relative z-10 text-center">
          <p className="max-w-[10rem] truncate text-[15px] font-bold tracking-[0.2px] text-foreground">{session?.name}</p>
          <p className="text-xs font-medium text-muted-foreground">{role === "Administrator" ? "Administrator" : "Staff"}</p>
        </div>

        <div className="absolute inset-x-5 bottom-0 z-10 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => item.roles.includes(role))
          if (items.length === 0) return null
          return (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{group.label}</p>
              <div className="mt-2 space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-4 shrink-0" />
          Sign-out
        </button>
      </div>
    </div>
  )
}
