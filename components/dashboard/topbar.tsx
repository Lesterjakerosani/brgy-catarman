"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { Bell, LogOut, Menu, Search, Settings, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { NAV_ITEMS } from "@/components/dashboard/nav-config"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useLogsStore } from "@/lib/stores/logs-store"
import { useCertificatesStore } from "@/lib/stores/certificates-store"
import { useResidentsStore } from "@/lib/stores/residents-store"
import { formatRelativeTime } from "@/lib/format"
import { getResidentFullName } from "@/data/residents"
import type { UserRole } from "@/types"

export function DashboardTopbar({ role }: { role: UserRole }) {
  const router = useRouter()
  const pathname = usePathname()
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const logoutEverywhere = useAuthStore((s) => s.logoutEverywhere)
  const notifications = useLogsStore((s) => s.notifications)
  const markAllRead = useLogsStore((s) => s.markAllNotificationsRead)
  const markRead = useLogsStore((s) => s.markNotificationRead)
  const certificateRequests = useCertificatesStore((s) => s.certificateRequests)
  const residents = useResidentsStore((s) => s.residents)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [today, setToday] = React.useState("")

  React.useEffect(() => {
    setToday(format(new Date(), "EEEE, MMMM d, yyyy"))
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const activeLabel = NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "Dashboard"

  function handleLogout() {
    logout()
    toast.success("You have been logged out.")
    router.replace("/login")
  }

  function handleLogoutEverywhere() {
    logoutEverywhere()
    toast.success("All active sessions have been terminated.")
    router.replace("/login")
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const term = query.trim().toLowerCase()
    if (!term) return

    const cert = certificateRequests.find((r) => r.referenceNumber.toLowerCase().includes(term) || r.requestorName.toLowerCase().includes(term))
    if (cert) {
      router.push(`/dashboard/certificates/${cert.id}/print`)
      setQuery("")
      return
    }
    const resident = residents.find((r) => getResidentFullName(r).toLowerCase().includes(term))
    if (resident) {
      router.push(`/dashboard/residents/${resident.id}`)
      setQuery("")
      return
    }
    toast.error(`No results found for "${query}".`)
  }

  if (!session) return null

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6 print:hidden">
      <div className="flex shrink-0 items-center gap-2.5 lg:w-64">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <DashboardSidebar role={role} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard/overview" className="hidden items-center gap-2.5 lg:flex">
          <BarangaySeal className="size-8" />
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold text-foreground">e-Catarman</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Digital Barangay OMS</p>
          </div>
        </Link>
      </div>

      <div className="hidden flex-1 flex-col items-center justify-center leading-tight md:flex">
        <p className="text-sm font-semibold text-foreground">{activeLabel}</p>
        <p className="text-xs text-muted-foreground">{today}</p>
      </div>

      <form onSubmit={handleSearch} className="relative hidden w-full max-w-xs sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search requests..."
          className="pl-9"
        />
      </form>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <DropdownMenu onOpenChange={(open) => !open && unreadCount > 0 && markAllRead()}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              {unreadCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-red-600 p-0 text-[10px] text-white">
                  {unreadCount}
                </Badge>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {notifications.slice(0, 8).map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 whitespace-normal" onClick={() => markRead(n.id)}>
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{n.title}</span>
                      {!n.isRead ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
                    </span>
                    <span className="text-xs text-muted-foreground">{n.message}</span>
                    <span className="text-[11px] text-muted-foreground/70">{formatRelativeTime(n.createdAt)}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-semibold">{session.name}</span>
              <span className="text-xs font-normal text-muted-foreground">{session.email}</span>
              <Badge variant="outline" className="mt-1.5 w-fit text-[11px]">{session.role}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={session.role === "Administrator" ? "/dashboard/profile" : "/dashboard/settings"}>
                <Settings className="size-4" />
                {session.role === "Administrator" ? "Profile Settings" : "My Account"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4" />
              Log Out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogoutEverywhere} className="text-destructive focus:text-destructive">
              <ShieldOff className="size-4" />
              Log Out Everywhere
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
