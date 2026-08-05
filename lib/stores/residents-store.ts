import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { residents as seedResidents } from "@/data/residents"
import type { Resident, ResidentFormValues } from "@/types"
import { generateId } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"

interface ResidentsState {
  residents: Resident[]
  addResident: (values: ResidentFormValues, actor: string) => Resident
  updateResident: (id: string, values: ResidentFormValues, actor: string) => void
  deleteResident: (id: string, actor: string) => void
  assignTags: (id: string, tags: Resident["tags"], actor: string) => void
  linkToHousehold: (residentId: string, patch: { householdId?: string; isHouseholdHead: boolean; relationshipToHead?: string }) => void
}

function toResident(values: ResidentFormValues, existing?: Resident): Resident {
  const now = new Date().toISOString()
  return {
    id: existing?.id ?? generateId("res"),
    photoUrl: values.photoUrl ?? existing?.photoUrl ?? "",
    firstName: values.firstName,
    middleName: values.middleName,
    lastName: values.lastName,
    suffix: values.suffix,
    gender: values.gender,
    birthdate: values.birthdate,
    civilStatus: values.civilStatus,
    religion: values.religion,
    occupation: values.occupation,
    educationalAttainment: values.educationalAttainment,
    address: { purok: values.purok as Resident["address"]["purok"], street: values.street, houseNumber: values.houseNumber },
    contactNumber: values.contactNumber,
    email: values.email,
    householdId: values.householdId,
    emergencyContactName: values.emergencyContactName,
    emergencyContactNumber: values.emergencyContactNumber,
    tags: values.tags,
    isRegisteredVoter: values.isRegisteredVoter,
    isHouseholdHead: existing?.isHouseholdHead ?? false,
    isActive: existing?.isActive ?? true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export const useResidentsStore = create<ResidentsState>()(
  persist(
    (set, get) => ({
      residents: seedResidents,
      addResident: (values, actor) => {
        const resident = toResident(values)
        set((state) => ({ residents: [resident, ...state.residents] }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Added new resident record",
          module: "Residents",
          description: `${actor} added a new resident record for ${resident.firstName} ${resident.lastName}.`,
        })
        return resident
      },
      updateResident: (id, values, actor) => {
        const existing = get().residents.find((r) => r.id === id)
        if (!existing) return
        const updated = toResident(values, existing)
        set((state) => ({
          residents: state.residents.map((r) => (r.id === id ? updated : r)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Updated resident information",
          module: "Residents",
          description: `${actor} updated the record of ${updated.firstName} ${updated.lastName}.`,
        })
      },
      deleteResident: (id, actor) => {
        const existing = get().residents.find((r) => r.id === id)
        set((state) => ({ residents: state.residents.filter((r) => r.id !== id) }))
        if (existing) {
          useLogsStore.getState().addLog({
            actorName: actor,
            actorRole: "Staff",
            action: "Deleted resident record",
            module: "Residents",
            description: `${actor} deleted the record of ${existing.firstName} ${existing.lastName}.`,
          })
        }
      },
      assignTags: (id, tags, actor) => {
        set((state) => ({
          residents: state.residents.map((r) => (r.id === id ? { ...r, tags, updatedAt: new Date().toISOString() } : r)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Updated resident tags",
          module: "Residents",
          description: `${actor} updated tags for resident ${id}.`,
        })
      },
      linkToHousehold: (residentId, patch) => {
        set((state) => ({
          residents: state.residents.map((r) =>
            r.id === residentId
              ? {
                  ...r,
                  householdId: patch.householdId,
                  isHouseholdHead: patch.isHouseholdHead,
                  relationshipToHead: patch.isHouseholdHead ? undefined : patch.relationshipToHead,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }))
      },
    }),
    { name: "catarman-residents-store", storage: idbJSONStorage }
  )
)
