"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResidentFormDialog } from "@/components/dashboard/residents/resident-form-dialog"
import { useAllResidents, useDeleteResident } from "@/lib/api/hooks/use-residents"
import { getResidentAge, getResidentFullName } from "@/data/residents"
import { PUROKS } from "@/lib/constants"
import type { Resident } from "@/types"

export default function ResidentsPage() {
  const router = useRouter()
  const { residents } = useAllResidents()
  const deleteResident = useDeleteResident()

  const [purokFilter, setPurokFilter] = React.useState<string>("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Resident | undefined>()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const filtered = React.useMemo(
    () => (purokFilter === "all" ? residents : residents.filter((r) => r.address.purok === purokFilter)),
    [residents, purokFilter]
  )

  const columns = React.useMemo<ColumnDef<Resident>[]>(
    () => [
      {
        accessorFn: (r) => getResidentFullName(r),
        id: "name",
        header: "Resident",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <InitialsAvatar name={getResidentFullName(row.original)} photoUrl={row.original.photoUrl} size="sm" />
            <div>
              <p className="font-medium text-foreground">{getResidentFullName(row.original)}</p>
              <p className="text-xs text-muted-foreground">{row.original.gender} · {getResidentAge(row.original.birthdate)} yrs old</p>
            </div>
          </div>
        ),
      },
      {
        id: "address",
        header: "Address",
        accessorFn: (r) => `${r.address.houseNumber} ${r.address.street}`,
        cell: ({ row }) => (
          <div>
            <p className="text-foreground">{row.original.address.purok}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.address.houseNumber} {row.original.address.street}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "contactNumber",
        header: "Contact",
        cell: ({ row }) => row.original.contactNumber || "—",
      },
      {
        id: "tags",
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              row.original.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px]">
                  {tag}
                </Badge>
              ))
            )}
            {row.original.tags.length > 2 ? <Badge variant="outline" className="text-[11px]">+{row.original.tags.length - 2}</Badge> : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "View Profile", icon: Eye, onClick: () => router.push(`/dashboard/residents/${row.original.id}`) },
              { label: "Edit", icon: Pencil, onClick: () => { setEditing(row.original); setFormOpen(true) } },
              { label: "Delete", icon: Trash2, destructive: true, separatorBefore: true, onClick: () => setDeletingId(row.original.id) },
            ]}
          />
        ),
      },
    ],
    [router]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resident Management"
        description="Manage resident records, profiles, and household information."
        actions={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <Plus className="size-4" />
            Add Resident
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by name, contact number..."
        emptyTitle="No residents found"
        emptyDescription="Try adjusting your filters or add a new resident."
        toolbar={
          <Select value={purokFilter} onValueChange={setPurokFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Purok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Puroks</SelectItem>
              {PUROKS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <ResidentFormDialog open={formOpen} onOpenChange={setFormOpen} resident={editing} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Resident Record"
        description="This will permanently remove this resident's record from the system. This action cannot be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) deleteResident.mutate(deletingId)
        }}
      />
    </div>
  )
}
