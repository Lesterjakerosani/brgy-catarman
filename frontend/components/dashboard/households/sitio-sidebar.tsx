"use client"

import * as React from "react"
import { Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAllHouseholds } from "@/lib/api/hooks/use-households"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { useSitios } from "@/lib/api/hooks/use-geography"
import { useMe } from "@/lib/api/hooks/use-auth"
import { formatUpdatedLabel } from "@/lib/format"
import { cn } from "@/lib/utils"

interface SitioSummary {
  id: string
  name: string
  householdCount: number
  residentCount: number
  lastUpdated?: string
}

function useSitioSummaries(): SitioSummary[] {
  const { sitios, puroks } = useSitios()
  const { households } = useAllHouseholds()
  const { residents } = useAllResidents()

  const residentToHouseholdId = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const household of households) {
      for (const memberId of household.memberIds) {
        map.set(memberId, household.id)
      }
    }
    return map
  }, [households])

  return React.useMemo(
    () =>
      sitios.map((sitio) => {
        const purokIds = new Set(puroks.filter((p) => p.sitioId === sitio.id).map((p) => p.id))
        const sitioHouseholds = households.filter((h) => purokIds.has(h.purokId))
        const householdIds = new Set(sitioHouseholds.map((h) => h.id))
        const residentCount = residents.filter((r) => {
          const hId = residentToHouseholdId.get(r.id)
          return hId ? householdIds.has(hId) : false
        }).length
        const lastUpdated = sitioHouseholds.reduce<string | undefined>((latest, h) => {
          if (!latest) return h.updatedAt
          return new Date(h.updatedAt) > new Date(latest) ? h.updatedAt : latest
        }, undefined)

        return { id: sitio.id, name: sitio.name, householdCount: sitioHouseholds.length, residentCount, lastUpdated }
      }),
    [sitios, puroks, households, residents, residentToHouseholdId]
  )
}

interface SitioSidebarProps {
  selectedSitioId: string
  onSelect: (sitioId: string) => void
  onEdit?: (sitioId: string) => void
  onDelete?: (sitioId: string) => void
}

export function SitioSidebar({ selectedSitioId, onSelect, onEdit, onDelete }: SitioSidebarProps) {
  const summaries = useSitioSummaries()
  const { data: session } = useMe()
  const canManage = Boolean(session)

  return (
    <nav aria-label="Sitios" className="hidden w-[280px] shrink-0 lg:block">
      <div className="sticky top-24 space-y-1 rounded-[12px] border border-border bg-card p-2 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
        <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sitios</p>
        {summaries.map((summary) => {
          const isSelected = summary.id === selectedSitioId
          return (
            <div
              key={summary.id}
              className={cn(
                "flex items-start gap-1 rounded-[8px] border-l-2 border-transparent transition-colors duration-150",
                isSelected ? "border-l-primary bg-primary/10" : "hover:bg-secondary"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(summary.id)}
                aria-current={isSelected ? "true" : undefined}
                className="flex min-w-0 flex-1 items-start gap-2.5 px-2.5 py-2.5 text-left"
              >
                <Folder className={cn("mt-0.5 size-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                    {summary.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {summary.householdCount} Household{summary.householdCount !== 1 ? "s" : ""} • {summary.residentCount} Resident
                    {summary.residentCount !== 1 ? "s" : ""}
                  </span>
                  <span className="block text-[11px] text-muted-foreground/70">Updated {formatUpdatedLabel(summary.lastUpdated)}</span>
                </span>
              </button>
              {canManage ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-1 mr-1 size-7 shrink-0 rounded-[8px] text-muted-foreground hover:bg-secondary"
                      aria-label="Sitio actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit?.(summary.id)}>
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(summary.id)}>
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

export function MobileSitioSelect({ selectedSitioId, onSelect }: SitioSidebarProps) {
  const summaries = useSitioSummaries()

  return (
    <div className="lg:hidden">
      <Select value={selectedSitioId} onValueChange={onSelect}>
        <SelectTrigger className="h-11 w-full rounded-[12px] border-border bg-card">
          <SelectValue placeholder="Select a sitio" />
        </SelectTrigger>
        <SelectContent>
          {summaries.map((summary) => (
            <SelectItem key={summary.id} value={summary.id}>
              {summary.name} · {summary.householdCount} household{summary.householdCount !== 1 ? "s" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
