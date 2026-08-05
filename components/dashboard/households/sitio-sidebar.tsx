"use client"

import * as React from "react"
import { Folder } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHouseholdsStore } from "@/lib/stores/households-store"
import { useResidentsStore } from "@/lib/stores/residents-store"
import { useSitiosStore } from "@/lib/stores/sitios-store"
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
  const sitios = useSitiosStore((s) => s.sitios)
  const puroks = useSitiosStore((s) => s.puroks)
  const households = useHouseholdsStore((s) => s.households)
  const residents = useResidentsStore((s) => s.residents)

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
}

export function SitioSidebar({ selectedSitioId, onSelect }: SitioSidebarProps) {
  const summaries = useSitioSummaries()

  return (
    <nav aria-label="Sitios" className="hidden w-[280px] shrink-0 lg:block">
      <div className="sticky top-24 space-y-1 rounded-[12px] border border-[#E2E8F0] bg-white p-2 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
        <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">Sitios</p>
        {summaries.map((summary) => {
          const isSelected = summary.id === selectedSitioId
          return (
            <button
              key={summary.id}
              type="button"
              onClick={() => onSelect(summary.id)}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-[8px] border-l-2 border-transparent px-2.5 py-2.5 text-left transition-colors duration-150",
                isSelected ? "border-l-[#1E40AF] bg-[#EFF6FF]" : "hover:bg-[#F1F5F9]"
              )}
            >
              <Folder className={cn("mt-0.5 size-4 shrink-0", isSelected ? "text-[#1E40AF]" : "text-[#64748B]")} />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-sm font-semibold", isSelected ? "text-[#1E40AF]" : "text-[#0F172A]")}>
                  {summary.name}
                </span>
                <span className="block text-xs text-[#64748B]">
                  {summary.householdCount} Household{summary.householdCount !== 1 ? "s" : ""} • {summary.residentCount} Resident
                  {summary.residentCount !== 1 ? "s" : ""}
                </span>
                <span className="block text-[11px] text-[#94A3B8]">Updated {formatUpdatedLabel(summary.lastUpdated)}</span>
              </span>
            </button>
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
        <SelectTrigger className="h-11 w-full rounded-[12px] border-[#E2E8F0] bg-white">
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
