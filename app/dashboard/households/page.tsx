"use client"

import * as React from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { Building2, ChevronRight, FolderPlus, MapPinned, Plus, UsersRound } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { HouseholdToolbar } from "@/components/dashboard/households/household-toolbar"
import { HouseholdStatCard } from "@/components/dashboard/households/household-stat-card"
import { SitioSidebar, MobileSitioSelect } from "@/components/dashboard/households/sitio-sidebar"
import { HouseholdExplorer } from "@/components/dashboard/households/household-explorer"
import { HouseholdFormDialog } from "@/components/dashboard/households/household-form-dialog"
import { AddSitioDialog } from "@/components/dashboard/households/add-sitio-dialog"
import { useHouseholdsStore } from "@/lib/stores/households-store"
import { useResidentsStore } from "@/lib/stores/residents-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useSitiosStore } from "@/lib/stores/sitios-store"
import { householdMatchesSearch } from "@/lib/household-search"
import type { HouseholdStatus } from "@/lib/household-status"
import type { Household, HouseholdClassification } from "@/types"

export default function HouseholdsPage() {
  const households = useHouseholdsStore((s) => s.households)
  const deleteHousehold = useHouseholdsStore((s) => s.deleteHousehold)
  const residents = useResidentsStore((s) => s.residents)
  const session = useAuthStore((s) => s.session)
  const sitios = useSitiosStore((s) => s.sitios)
  const puroks = useSitiosStore((s) => s.puroks)

  const [selectedSitioId, setSelectedSitioId] = React.useState(sitios[0].id)
  const [search, setSearch] = React.useState("")
  const [classificationFilter, setClassificationFilter] = React.useState<HouseholdClassification[]>([])
  const [statusFilter, setStatusFilter] = React.useState<HouseholdStatus[]>([])
  const [expandedHousehold, setExpandedHousehold] = React.useState<string | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Household | undefined>()
  const [formDefaults, setFormDefaults] = React.useState<{ sitioId?: string; purokId?: string }>({})
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [addSitioOpen, setAddSitioOpen] = React.useState(false)

  const residentMap = React.useMemo(() => new Map(residents.map((r) => [r.id, r])), [residents])

  function handleToggleHousehold(householdId: string) {
    setExpandedHousehold((prev) => (prev === householdId ? null : householdId))
  }

  function handleSelectSitio(sitioId: string) {
    setSelectedSitioId(sitioId)
    setExpandedHousehold(null)
  }

  // If the search term matches a household outside the currently selected
  // Sitio, jump the panel to that Sitio so results are actually visible.
  React.useEffect(() => {
    const term = search.trim()
    if (!term) return

    const match = households.find((h) => householdMatchesSearch(h, residentMap, term))
    if (!match) return

    setSelectedSitioId((prev) => (prev === match.sitioId ? prev : match.sitioId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function openAddDialog(sitioId?: string) {
    const targetSitioId = sitioId ?? selectedSitioId
    const puroksForSitio = puroks.filter((p) => p.sitioId === targetSitioId)
    setEditing(undefined)
    setFormDefaults({ sitioId: targetSitioId, purokId: puroksForSitio[0]?.id })
    setFormOpen(true)
  }

  function openEditDialog(household: Household) {
    setEditing(household)
    setFormDefaults({})
    setFormOpen(true)
  }

  const totalResidents = residents.length
  const selectedSitio = sitios.find((s) => s.id === selectedSitioId)
  const selectedSitioHouseholdCount = households.filter((h) => h.sitioId === selectedSitioId).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#64748B]">
            <Link href="/dashboard/overview" className="hover:text-[#1E40AF] hover:underline">
              Dashboard
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-[#0F172A]">Household Management</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">
            Household Management
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">Manage all household records organized by Sitio and Purok.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="h-11 w-full rounded-xl bg-[#1E40AF] px-5 text-sm font-semibold text-white shadow-none transition-colors duration-150 hover:bg-[#1D4ED8] sm:w-auto"
            onClick={() => setAddSitioOpen(true)}
          >
            <FolderPlus className="size-4.5" />
            Add Sitio
          </Button>
          <Button
            className="h-11 w-full rounded-xl bg-[#1E40AF] px-5 text-sm font-semibold text-white shadow-none transition-colors duration-150 hover:bg-[#1D4ED8] sm:w-auto"
            onClick={() => openAddDialog()}
          >
            <Plus className="size-4.5" />
            New Household
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <HouseholdStatCard label="Households" description="Registered Records" value={households.length} icon={Building2} />
        <HouseholdStatCard label="Families" description="Registered Families" value={households.length} icon={UsersRound} />
        <HouseholdStatCard label="Residents" description="Linked Residents" value={totalResidents} icon={UsersRound} />
        <HouseholdStatCard label="Sitios" description="Coverage Areas" value={sitios.length} icon={MapPinned} />
      </div>

      <HouseholdToolbar
        search={search}
        onSearchChange={setSearch}
        classificationFilter={classificationFilter}
        onClassificationFilterChange={setClassificationFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => toast.success("Household list refreshed.")}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <SitioSidebar selectedSitioId={selectedSitioId} onSelect={handleSelectSitio} />

        <div className="min-w-0 flex-1 space-y-4">
          <MobileSitioSelect selectedSitioId={selectedSitioId} onSelect={handleSelectSitio} />

          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-semibold text-[#0F172A]">{selectedSitio?.name ?? "Sitio"}</h2>
            <span className="text-sm text-[#64748B]">
              {selectedSitioHouseholdCount} Household{selectedSitioHouseholdCount !== 1 ? "s" : ""}
            </span>
          </div>

          <HouseholdExplorer
            sitioId={selectedSitioId}
            searchTerm={search}
            classificationFilter={classificationFilter}
            statusFilter={statusFilter}
            expandedHouseholdId={expandedHousehold}
            onToggleHousehold={handleToggleHousehold}
            onEdit={openEditDialog}
            onDelete={setDeletingId}
          />
        </div>
      </div>

      <AddSitioDialog open={addSitioOpen} onOpenChange={setAddSitioOpen} onCreated={(sitioId) => setSelectedSitioId(sitioId)} />

      <HouseholdFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        household={editing}
        defaultSitioId={formDefaults.sitioId}
        defaultPurokId={formDefaults.purokId}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Household"
        description="This will permanently remove this household record. Member resident records will not be deleted."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) {
            deleteHousehold(deletingId, session?.name ?? "Staff")
            toast.success("Household deleted.")
          }
        }}
      />
    </div>
  )
}
