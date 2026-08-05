"use client"

import * as React from "react"
import toast from "react-hot-toast"
import { Download, Filter, Printer, RefreshCw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HOUSEHOLD_CLASSIFICATIONS } from "@/lib/constants"
import { SearchHousehold } from "@/components/dashboard/households/search-household"
import type { HouseholdStatus } from "@/lib/household-status"
import { cn } from "@/lib/utils"
import type { HouseholdClassification } from "@/types"

const HOUSEHOLD_STATUSES: HouseholdStatus[] = ["Active", "Inactive", "Archived"]

interface HouseholdToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  classificationFilter: HouseholdClassification[]
  onClassificationFilterChange: (value: HouseholdClassification[]) => void
  statusFilter: HouseholdStatus[]
  onStatusFilterChange: (value: HouseholdStatus[]) => void
  onRefresh: () => void
}

const TOOLBAR_BUTTON_CLASS =
  "h-10 rounded-[10px] border-[#E2E8F0] bg-white text-sm font-medium text-[#334155] transition-colors duration-150 hover:bg-[#F1F5F9]"

export function HouseholdToolbar({
  search,
  onSearchChange,
  classificationFilter,
  onClassificationFilterChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
}: HouseholdToolbarProps) {
  const [refreshing, setRefreshing] = React.useState(false)

  function toggleClassification(value: HouseholdClassification) {
    onClassificationFilterChange(
      classificationFilter.includes(value) ? classificationFilter.filter((c) => c !== value) : [...classificationFilter, value]
    )
  }

  function toggleStatus(value: HouseholdStatus) {
    onStatusFilterChange(statusFilter.includes(value) ? statusFilter.filter((s) => s !== value) : [...statusFilter, value])
  }

  function handleRefresh() {
    setRefreshing(true)
    onRefresh()
    window.setTimeout(() => {
      setRefreshing(false)
      toast.success("Household list refreshed.")
    }, 500)
  }

  function handleExport() {
    toast.success("Exporting household records...")
  }

  function handleImport() {
    toast.success("Import household records from a spreadsheet.")
  }

  function handlePrint() {
    toast.success("Preparing household list for printing...")
  }

  const activeFilterCount = classificationFilter.length + statusFilter.length

  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-[#E2E8F0] bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center">
      <SearchHousehold value={search} onChange={onSearchChange} />

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={TOOLBAR_BUTTON_CLASS}>
              <Filter className="size-4 text-[#64748B]" />
              Filter
              {activeFilterCount > 0 ? (
                <span className="ml-0.5 flex size-4.5 items-center justify-center rounded-full bg-[#1E40AF] text-[10px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {HOUSEHOLD_STATUSES.map((s) => (
              <DropdownMenuCheckboxItem key={s} checked={statusFilter.includes(s)} onCheckedChange={() => toggleStatus(s)}>
                {s}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuLabel className="mt-1">Filter by Classification</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {HOUSEHOLD_CLASSIFICATIONS.map((c) => (
              <DropdownMenuCheckboxItem key={c} checked={classificationFilter.includes(c)} onCheckedChange={() => toggleClassification(c)}>
                {c}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className={TOOLBAR_BUTTON_CLASS} onClick={handleRefresh}>
          <RefreshCw className={cn("size-4 text-[#64748B] transition-transform duration-200", refreshing && "rotate-180")} />
          Refresh
        </Button>

        <Button variant="outline" className={TOOLBAR_BUTTON_CLASS} onClick={handleImport}>
          <Upload className="size-4 text-[#64748B]" />
          Import
        </Button>

        <Button variant="outline" className={TOOLBAR_BUTTON_CLASS} onClick={handleExport}>
          <Download className="size-4 text-[#64748B]" />
          Export
        </Button>

        <Button variant="outline" className={TOOLBAR_BUTTON_CLASS} onClick={handlePrint}>
          <Printer className="size-4 text-[#64748B]" />
          Print
        </Button>
      </div>
    </div>
  )
}
