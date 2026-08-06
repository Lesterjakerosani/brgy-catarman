import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { staffMembers as seedStaff } from "@/data/staff"
import type { StaffFormValues, StaffMember } from "@/types"
import { generateId } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"
import { useEngagementStore } from "@/lib/stores/engagement-store"
import { DEMO_PASSWORD } from "@/lib/auth-constants"

interface StaffState {
  staffMembers: StaffMember[]
  addStaff: (values: StaffFormValues, actor: string) => StaffMember
  updateStaff: (id: string, values: StaffFormValues, actor: string) => void
  deleteStaff: (id: string, actor: string) => void
  toggleStatus: (id: string, actor: string) => void
  updateAvatar: (id: string, avatarUrl: string, actor: string) => void
  changeOwnPassword: (id: string, currentPassword: string, newPassword: string) => { success: boolean; error?: string }
  setStaffPassword: (id: string, newPassword: string, actor: string) => void
  updateName: (id: string, newName: string) => { success: boolean; error?: string }
}

export const useStaffStore = create<StaffState>()(
  persist(
    (set, get) => ({
      staffMembers: seedStaff,
      addStaff: (values, actor) => {
        const now = new Date().toISOString()
        const staff: StaffMember = {
          id: generateId("stf"),
          name: values.name,
          email: values.email,
          role: values.role,
          position: values.position,
          contactNumber: values.contactNumber,
          status: values.status,
          createdAt: now,
        }
        set((state) => ({ staffMembers: [staff, ...state.staffMembers] }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Added new staff account",
          module: "Staff",
          description: `${actor} created a staff account for ${staff.name} (${staff.position}). A welcome email was sent to ${staff.email}.`,
        })
        return staff
      },
      updateStaff: (id, values, actor) => {
        set((state) => ({
          staffMembers: state.staffMembers.map((s) =>
            s.id === id
              ? { ...s, name: values.name, email: values.email, role: values.role, position: values.position, contactNumber: values.contactNumber, status: values.status }
              : s
          ),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Updated staff account",
          module: "Staff",
          description: `${actor} updated staff account ${id}.`,
        })
      },
      deleteStaff: (id, actor) => {
        const existing = get().staffMembers.find((s) => s.id === id)
        set((state) => ({ staffMembers: state.staffMembers.filter((s) => s.id !== id) }))
        if (existing) {
          useLogsStore.getState().addLog({
            actorName: actor,
            actorRole: "Administrator",
            action: "Deleted staff account",
            module: "Staff",
            description: `${actor} deleted the staff account of ${existing.name}.`,
          })
        }
      },
      toggleStatus: (id, actor) => {
        const existing = get().staffMembers.find((s) => s.id === id)
        set((state) => ({
          staffMembers: state.staffMembers.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Disabled" : "Active" } : s)),
        }))
        if (existing) {
          useLogsStore.getState().addLog({
            actorName: actor,
            actorRole: "Administrator",
            action: existing.status === "Active" ? "Disabled staff account" : "Enabled staff account",
            module: "Staff",
            description: `${actor} ${existing.status === "Active" ? "disabled" : "enabled"} the account of ${existing.name}.`,
          })
        }
      },
      updateAvatar: (id, avatarUrl, actor) => {
        set((state) => ({
          staffMembers: state.staffMembers.map((s) => (s.id === id ? { ...s, avatarUrl } : s)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Updated profile photo",
          module: "Staff",
          description: `${actor} updated their profile photo.`,
        })
      },
      changeOwnPassword: (id, currentPassword, newPassword) => {
        const existing = get().staffMembers.find((s) => s.id === id)
        if (!existing) return { success: false, error: "Account not found." }
        const expectedPassword = existing.password ?? DEMO_PASSWORD
        if (currentPassword !== expectedPassword) {
          return { success: false, error: "Current password is incorrect." }
        }
        set((state) => ({
          staffMembers: state.staffMembers.map((s) => (s.id === id ? { ...s, password: newPassword } : s)),
        }))
        useLogsStore.getState().addLog({
          actorName: existing.name,
          actorRole: existing.role,
          action: "Changed password",
          module: "Staff",
          description: `${existing.name} changed their own password.`,
        })
        return { success: true }
      },
      updateName: (id, newName) => {
        const trimmed = newName.trim()
        if (!trimmed) return { success: false, error: "Please enter a name." }
        const existing = get().staffMembers.find((s) => s.id === id)
        if (!existing) return { success: false, error: "Account not found." }
        const oldName = existing.name
        if (oldName === trimmed) return { success: true }
        set((state) => ({
          staffMembers: state.staffMembers.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
        }))
        useEngagementStore.getState().renameAuthor(oldName, trimmed)
        useLogsStore.getState().addLog({
          actorName: trimmed,
          actorRole: existing.role,
          action: "Changed name",
          module: "Staff",
          description: `${oldName} changed their display name to ${trimmed}.`,
        })
        return { success: true }
      },
      setStaffPassword: (id, newPassword, actor) => {
        const existing = get().staffMembers.find((s) => s.id === id)
        if (!existing) return
        set((state) => ({
          staffMembers: state.staffMembers.map((s) => (s.id === id ? { ...s, password: newPassword } : s)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Changed staff password",
          module: "Staff",
          description: `${actor} changed the password for ${existing.name}.`,
        })
      },
    }),
    {
      name: "catarman-staff-store",
      storage: idbJSONStorage,
      version: 1,
      migrate: (persisted) => {
        const state = persisted as StaffState
        if (state?.staffMembers) {
          const existingEmails = new Set(state.staffMembers.map((s) => s.email.toLowerCase()))
          const missingSeedAccounts = seedStaff.filter((s) => !existingEmails.has(s.email.toLowerCase()))
          if (missingSeedAccounts.length > 0) {
            state.staffMembers = [...state.staffMembers, ...missingSeedAccounts]
          }
        }
        return state
      },
    }
  )
)
