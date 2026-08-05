"use client"

import * as React from "react"
import toast from "react-hot-toast"
import {
  Archive,
  ArchiveRestore,
  Eye,
  FileText,
  Folder,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash2,
  UsersRound,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { HighlightMatch } from "@/components/dashboard/households/highlight-match"
import { FamilyMembersTable } from "@/components/dashboard/households/family-members-table"
import { useHouseholdsStore } from "@/lib/stores/households-store"
import { useResidentsStore } from "@/lib/stores/residents-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useSitiosStore } from "@/lib/stores/sitios-store"
import { getResidentFullName } from "@/data/residents"
import { householdMatchesSearch } from "@/lib/household-search"
import { getHouseholdStatus, type HouseholdStatus } from "@/lib/household-status"
import { cn } from "@/lib/utils"
import type { Household, HouseholdClassification } from "@/types"

interface HouseholdExplorerProps {
  sitioId: string
  searchTerm: string
  classificationFilter: HouseholdClassification[]
  statusFilter: HouseholdStatus[]
  expandedHouseholdId: string | null
  onToggleHousehold: (id: string) => void
  onEdit: (household: Household) => void
  onDelete: (id: string) => void
}

const STATUS_STYLES: Record<HouseholdStatus, string> = {
  Active: "bg-[#DCFCE7] text-[#16A34A]",
  Inactive: "bg-[#F1F5F9] text-[#64748B]",
  Archived: "bg-[#FEE2E2] text-[#DC2626]",
}

function HouseholdStatusBadge({ status }: { status: HouseholdStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>
      {status}
    </span>
  )
}

export function HouseholdExplorer({
  sitioId,
  searchTerm,
  classificationFilter,
  statusFilter,
  expandedHouseholdId,
  onToggleHousehold,
  onEdit,
  onDelete,
}: HouseholdExplorerProps) {
  const allHouseholds = useHouseholdsStore((s) => s.households)
  const archiveHousehold = useHouseholdsStore((s) => s.archiveHousehold)
  const restoreHousehold = useHouseholdsStore((s) => s.restoreHousehold)
  const residents = useResidentsStore((s) => s.residents)
  const allPuroks = useSitiosStore((s) => s.puroks)
  const session = useAuthStore((s) => s.session)
  const actor = session?.name ?? "Staff"

  const [expandedPurokId, setExpandedPurokId] = React.useState<string | null>(null)
  const [switching, setSwitching] = React.useState(false)

  const residentMap = React.useMemo(() => new Map(residents.map((r) => [r.id, r])), [residents])
  const puroks = React.useMemo(() => allPuroks.filter((p) => p.sitioId === sitioId), [allPuroks, sitioId])

  // Reset the open Purok and briefly show a switching skeleton whenever the
  // selected Sitio changes.
  React.useEffect(() => {
    setExpandedPurokId(null)
    setSwitching(true)
    const timer = window.setTimeout(() => setSwitching(false), 200)
    return () => window.clearTimeout(timer)
  }, [sitioId])

  const purokRows = React.useMemo(() => {
    return puroks.map((purok) => {
      const purokHouseholds = allHouseholds
        .filter((h) => h.purokId === purok.id)
        .filter((h) => householdMatchesSearch(h, residentMap, searchTerm))
        .filter((h) => classificationFilter.length === 0 || classificationFilter.includes(h.classification))

      const withDerived = purokHouseholds.map((h) => {
        const head = residentMap.get(h.headResidentId)
        return { household: h, headName: head ? getResidentFullName(head) : "Unassigned", status: getHouseholdStatus(h, residentMap) }
      })

      const filtered = statusFilter.length === 0 ? withDerived : withDerived.filter((r) => statusFilter.includes(r.status))
      filtered.sort((a, b) => a.household.householdNumber.localeCompare(b.household.householdNumber))

      const residentCount = filtered.reduce((sum, r) => sum + r.household.memberIds.length, 0)

      return { purok, households: filtered, residentCount }
    })
  }, [puroks, allHouseholds, residentMap, searchTerm, classificationFilter, statusFilter])

  const totalMatching = purokRows.reduce((sum, p) => sum + p.households.length, 0)
  const hasActiveFilter = Boolean(searchTerm.trim()) || classificationFilter.length > 0 || statusFilter.length > 0

  // Auto-expand the Purok containing the first search match.
  React.useEffect(() => {
    const term = searchTerm.trim()
    if (!term) return

    const match = purokRows.find((p) => p.households.length > 0)
    if (!match) return

    setExpandedPurokId((prev) => (prev === match.purok.id ? prev : match.purok.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  function handleHouseholdAccordionChange(value: string) {
    if (value) {
      onToggleHousehold(value)
    } else if (expandedHouseholdId) {
      onToggleHousehold(expandedHouseholdId)
    }
  }

  if (switching) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-[12px]" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {hasActiveFilter && totalMatching === 0 ? (
        <p className="rounded-[12px] border border-dashed border-[#E2E8F0] bg-white px-4 py-6 text-center text-sm text-[#64748B]">
          No households match your search across this sitio.
        </p>
      ) : null}

      <Accordion
        type="single"
        collapsible
        value={expandedPurokId ?? ""}
        onValueChange={(value) => setExpandedPurokId(value || null)}
        className="space-y-3"
      >
        {purokRows.map(({ purok, households, residentCount }) => (
          <AccordionItem
            key={purok.id}
            value={purok.id}
            className="rounded-[12px] border border-[#E2E8F0] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.05)] transition-shadow duration-150 hover:shadow-[0_4px_10px_rgba(15,23,42,0.08)]"
          >
            <AccordionTrigger className="items-center px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-3">
                <Folder className="size-5 shrink-0 text-[#64748B]" />
                <span className="flex flex-col gap-0.5 text-left">
                  <span className="text-sm font-semibold text-[#0F172A]">{purok.name}</span>
                  <span className="text-xs text-[#64748B]">
                    {households.length} Household{households.length !== 1 ? "s" : ""} • {residentCount} Resident
                    {residentCount !== 1 ? "s" : ""}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-[#E2E8F0] px-3 pb-3">
              {households.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-[#64748B]">
                  {hasActiveFilter ? "No households match your search in this purok." : "No households in this purok yet."}
                </p>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  value={households.some((h) => h.household.id === expandedHouseholdId) ? (expandedHouseholdId ?? "") : ""}
                  onValueChange={handleHouseholdAccordionChange}
                  className="space-y-2 pt-3"
                >
                  {households.map(({ household, headName, status }) => (
                    <AccordionItem
                      key={household.id}
                      value={household.id}
                      className="rounded-[10px] border border-[#E2E8F0] bg-white transition-colors duration-150 hover:bg-[#F8FAFC]"
                    >
                      <div className="flex items-center gap-1 px-2">
                        <AccordionTrigger className="flex-1 items-center py-2.5 hover:no-underline">
                          <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                            <InitialsAvatar name={headName} size="sm" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-[#0F172A]">
                                <HighlightMatch text={headName} query={searchTerm} />
                              </span>
                              <span className="block text-xs text-[#64748B]">
                                <HighlightMatch text={household.householdNumber} query={searchTerm} />
                              </span>
                            </span>
                            <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-medium text-[#334155] sm:inline-flex">
                              <UsersRound className="size-3.5 text-[#64748B]" />
                              {household.memberIds.length}
                            </span>
                            <span className="shrink-0">
                              <HouseholdStatusBadge status={status} />
                            </span>
                          </span>
                        </AccordionTrigger>
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 rounded-[10px] text-[#64748B] hover:bg-[#F1F5F9]"
                                aria-label="Household actions"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem onClick={() => onToggleHousehold(household.id)}>
                                <Eye className="size-4" />
                                View Household
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(household)}>
                                <Pencil className="size-4" />
                                Edit Household
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toast.success(`Open Document Requests to generate a certificate for ${household.householdNumber}.`)}
                              >
                                <FileText className="size-4" />
                                Generate Certificate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success(`Preparing ${household.householdNumber} for printing...`)}>
                                <Printer className="size-4" />
                                Print Household Record
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {household.isArchived ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    restoreHousehold(household.id, actor)
                                    toast.success("Household restored.")
                                  }}
                                >
                                  <ArchiveRestore className="size-4" />
                                  Restore
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    archiveHousehold(household.id, actor)
                                    toast.success("Household archived.")
                                  }}
                                >
                                  <Archive className="size-4" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem variant="destructive" onClick={() => onDelete(household.id)}>
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <AccordionContent className="border-t border-[#E2E8F0] px-1">
                        <FamilyMembersTable household={household} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
