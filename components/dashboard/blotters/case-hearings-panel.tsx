"use client"

import * as React from "react"
import { CalendarPlus, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/shared/status-badge"
import { useBlottersStore } from "@/lib/stores/blotters-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { formatDate } from "@/lib/format"
import type { Blotter } from "@/types"

export function CaseHearingsPanel({ blotter }: { blotter: Blotter }) {
  const addHearing = useBlottersStore((s) => s.addHearing)
  const updateHearingStatus = useBlottersStore((s) => s.updateHearingStatus)
  const session = useAuthStore((s) => s.session)
  const actor = session?.name ?? "Staff"

  const [formOpen, setFormOpen] = React.useState(false)
  const [date, setDate] = React.useState("")
  const [notes, setNotes] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return
    addHearing(blotter.id, date, notes.trim() || undefined, actor)
    setDate("")
    setNotes("")
    setFormOpen(false)
  }

  const sortedHearings = [...blotter.hearings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Hearing Schedule</p>
        <Button variant="outline" size="sm" onClick={() => setFormOpen((v) => !v)}>
          <CalendarPlus className="size-3.5" />
          Schedule Hearing
        </Button>
      </div>

      {formOpen ? (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg border border-dashed border-border p-3">
          <div>
            <Label>Hearing Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" required />
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1.5"
              placeholder="Purpose of the hearing, attendees to notify, etc."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add Hearing
            </Button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 space-y-2">
        {sortedHearings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hearings scheduled yet.</p>
        ) : (
          sortedHearings.map((h) => (
            <div key={h.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{formatDate(h.date)}</p>
                {h.notes ? <p className="mt-0.5 text-xs text-muted-foreground">{h.notes}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={h.status} />
                {h.status === "Scheduled" ? (
                  <>
                    <button
                      type="button"
                      title="Mark completed"
                      onClick={() => updateHearingStatus(blotter.id, h.id, "Completed", actor)}
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      <CheckCircle2 className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Cancel hearing"
                      onClick={() => updateHearingStatus(blotter.id, h.id, "Cancelled", actor)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <XCircle className="size-4" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
