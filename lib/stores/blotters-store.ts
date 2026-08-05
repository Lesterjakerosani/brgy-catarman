import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { blotters as seedBlotters } from "@/data/blotters"
import type { Blotter, BlotterFormValues, BlotterStatus, HearingStatus } from "@/types"
import { generateId, generateCaseNumber } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"

interface BlottersState {
  blotters: Blotter[]
  addBlotter: (values: BlotterFormValues, actor: string) => Blotter
  updateBlotter: (id: string, values: BlotterFormValues, actor: string) => void
  updateStatus: (id: string, status: BlotterStatus, actor: string, resolution?: string) => void
  archiveBlotter: (id: string, actor: string) => void
  deleteBlotter: (id: string, actor: string) => void
  addHearing: (id: string, date: string, notes: string | undefined, actor: string) => void
  updateHearingStatus: (id: string, hearingId: string, status: HearingStatus, actor: string) => void
  addCaseNote: (id: string, note: string, actor: string) => void
}

export const useBlottersStore = create<BlottersState>()(
  persist(
    (set, get) => ({
      blotters: seedBlotters,
      addBlotter: (values, actor) => {
        const now = new Date()
        const sequence = get().blotters.length + 1
        const blotter: Blotter = {
          id: generateId("blt"),
          caseNumber: generateCaseNumber(sequence, now),
          incidentType: values.incidentType,
          complainantName: values.complainantName,
          complainantAddress: values.complainantAddress,
          complainantContact: values.complainantContact,
          respondentName: values.respondentName,
          respondentAddress: values.respondentAddress,
          incidentDate: values.incidentDate,
          location: values.location,
          narrative: values.narrative,
          status: "Open",
          mediator: values.mediator,
          hearings: [],
          isArchived: false,
          history: [{ id: generateId("h"), label: "Case Filed", actor, timestamp: now.toISOString() }],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        }
        set((state) => ({ blotters: [blotter, ...state.blotters] }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Filed new blotter case",
          module: "Blotters",
          description: `${actor} filed blotter case ${blotter.caseNumber}.`,
        })
        return blotter
      },
      updateBlotter: (id, values, actor) => {
        set((state) => ({
          blotters: state.blotters.map((b) => {
            if (b.id !== id) return b
            const now = new Date().toISOString()
            return {
              ...b,
              incidentType: values.incidentType,
              complainantName: values.complainantName,
              complainantAddress: values.complainantAddress,
              complainantContact: values.complainantContact,
              respondentName: values.respondentName,
              respondentAddress: values.respondentAddress,
              incidentDate: values.incidentDate,
              location: values.location,
              narrative: values.narrative,
              mediator: values.mediator,
              updatedAt: now,
              history: [...b.history, { id: generateId("h"), label: "Case Details Updated", actor, timestamp: now }],
            }
          }),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Updated blotter case",
          module: "Blotters",
          description: `${actor} updated blotter case ${id}.`,
        })
      },
      updateStatus: (id, status, actor, resolution) => {
        set((state) => ({
          blotters: state.blotters.map((b) => {
            if (b.id !== id) return b
            const now = new Date().toISOString()
            return {
              ...b,
              status,
              resolution: resolution ?? b.resolution,
              updatedAt: now,
              history: [...b.history, { id: generateId("h"), label: status, actor, timestamp: now }],
            }
          }),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Updated case status",
          module: "Blotters",
          description: `${actor} set blotter ${id} status to "${status}".`,
        })
      },
      archiveBlotter: (id, actor) => {
        set((state) => ({
          blotters: state.blotters.map((b) => (b.id === id ? { ...b, isArchived: true, status: "Archived", updatedAt: new Date().toISOString() } : b)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Archived blotter case",
          module: "Blotters",
          description: `${actor} archived blotter ${id}.`,
        })
      },
      deleteBlotter: (id, actor) => {
        set((state) => ({ blotters: state.blotters.filter((b) => b.id !== id) }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Deleted blotter case",
          module: "Blotters",
          description: `${actor} deleted blotter ${id}.`,
        })
      },
      addHearing: (id, date, notes, actor) => {
        set((state) => ({
          blotters: state.blotters.map((b) => {
            if (b.id !== id) return b
            const now = new Date().toISOString()
            return {
              ...b,
              hearings: [...b.hearings, { id: generateId("hr"), date, notes, status: "Scheduled" as HearingStatus }],
              updatedAt: now,
              history: [
                ...b.history,
                { id: generateId("h"), label: "Hearing Scheduled", description: notes, actor, timestamp: now },
              ],
            }
          }),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Scheduled hearing",
          module: "Blotters",
          description: `${actor} scheduled a hearing for blotter ${id}.`,
        })
      },
      updateHearingStatus: (id, hearingId, status, actor) => {
        set((state) => ({
          blotters: state.blotters.map((b) => {
            if (b.id !== id) return b
            const now = new Date().toISOString()
            return {
              ...b,
              hearings: b.hearings.map((h) => (h.id === hearingId ? { ...h, status } : h)),
              updatedAt: now,
              history: [...b.history, { id: generateId("h"), label: `Hearing ${status}`, actor, timestamp: now }],
            }
          }),
        }))
      },
      addCaseNote: (id, note, actor) => {
        set((state) => ({
          blotters: state.blotters.map((b) => {
            if (b.id !== id) return b
            const now = new Date().toISOString()
            return {
              ...b,
              updatedAt: now,
              history: [...b.history, { id: generateId("h"), label: "Case Note", description: note, actor, timestamp: now }],
            }
          }),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Added case note",
          module: "Blotters",
          description: `${actor} added a note to blotter ${id}.`,
        })
      },
    }),
    { name: "catarman-blotters-store", storage: idbJSONStorage }
  )
)
