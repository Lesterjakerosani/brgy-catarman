import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { households as seedHouseholds } from "@/data/households"
import { useSitiosStore } from "@/lib/stores/sitios-store"
import { useResidentsStore } from "@/lib/stores/residents-store"
import type { Household, HouseholdFormValues } from "@/types"
import { generateId, generateHouseholdNumber } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"

interface HouseholdsState {
  households: Household[]
  addHousehold: (values: HouseholdFormValues, actor: string) => Household
  updateHousehold: (id: string, values: HouseholdFormValues, actor: string) => void
  deleteHousehold: (id: string, actor: string) => void
  archiveHousehold: (id: string, actor: string) => void
  restoreHousehold: (id: string, actor: string) => void
}

function sitioCode(sitioId: string): string {
  // e.g. "sitio-catarman-1" -> "CAT1", "sitio-kansipak" -> "KAN"
  const name = sitioId.replace("sitio-", "")
  return name.replace(/-/g, "").slice(0, 6).toUpperCase()
}

// Keeps each Resident's householdId / isHouseholdHead / relationshipToHead in
// sync with the household record that owns them, so dashboards can derive
// head-vs-member and per-tag counts directly from Resident fields.
function syncMemberLinks(householdId: string, values: HouseholdFormValues) {
  const { linkToHousehold } = useResidentsStore.getState()
  for (const residentId of values.memberIds) {
    linkToHousehold(residentId, {
      householdId,
      isHouseholdHead: residentId === values.headResidentId,
      relationshipToHead: values.memberRelationships?.[residentId],
    })
  }
}

function unlinkResidents(residentIds: string[]) {
  const { linkToHousehold } = useResidentsStore.getState()
  for (const residentId of residentIds) {
    linkToHousehold(residentId, { householdId: undefined, isHouseholdHead: false, relationshipToHead: undefined })
  }
}

export const useHouseholdsStore = create<HouseholdsState>()(
  persist(
    (set, get) => ({
      households: seedHouseholds,
      addHousehold: (values, actor) => {
        const purok = useSitiosStore.getState().puroks.find((p) => p.id === values.purokId)
        const purokNumber = purok?.name.split(" ")[1] ?? "1"
        const sequence = get().households.filter((h) => h.purokId === values.purokId).length + 1
        const now = new Date().toISOString()
        const household: Household = {
          id: generateId("hh"),
          householdNumber: generateHouseholdNumber(sitioCode(values.sitioId), purokNumber, sequence),
          sitioId: values.sitioId,
          purokId: values.purokId,
          address: { street: values.street, houseNumber: values.houseNumber },
          headResidentId: values.headResidentId,
          memberIds: values.memberIds,
          contactNumber: values.contactNumber,
          classification: values.classification,
          is4PsBeneficiary: values.is4PsBeneficiary,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ households: [household, ...state.households] }))
        syncMemberLinks(household.id, values)
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Added new household",
          module: "Households",
          description: `${actor} registered household ${household.householdNumber}.`,
        })
        return household
      },
      updateHousehold: (id, values, actor) => {
        const existing = get().households.find((h) => h.id === id)
        const removedResidentIds = existing ? existing.memberIds.filter((residentId) => !values.memberIds.includes(residentId)) : []

        set((state) => ({
          households: state.households.map((h) =>
            h.id === id
              ? {
                  ...h,
                  sitioId: values.sitioId,
                  purokId: values.purokId,
                  address: { street: values.street, houseNumber: values.houseNumber },
                  headResidentId: values.headResidentId,
                  memberIds: values.memberIds,
                  contactNumber: values.contactNumber,
                  classification: values.classification,
                  is4PsBeneficiary: values.is4PsBeneficiary,
                  updatedAt: new Date().toISOString(),
                }
              : h
          ),
        }))
        unlinkResidents(removedResidentIds)
        syncMemberLinks(id, values)
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Updated household members",
          module: "Households",
          description: `${actor} updated household ${id}.`,
        })
      },
      deleteHousehold: (id, actor) => {
        const existing = get().households.find((h) => h.id === id)
        set((state) => ({ households: state.households.filter((h) => h.id !== id) }))
        if (existing) unlinkResidents(existing.memberIds)
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Removed household record",
          module: "Households",
          description: `${actor} removed household ${id}.`,
        })
      },
      archiveHousehold: (id, actor) => {
        set((state) => ({
          households: state.households.map((h) => (h.id === id ? { ...h, isArchived: true, updatedAt: new Date().toISOString() } : h)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Archived household record",
          module: "Households",
          description: `${actor} archived household ${id}.`,
        })
      },
      restoreHousehold: (id, actor) => {
        set((state) => ({
          households: state.households.map((h) => (h.id === id ? { ...h, isArchived: false, updatedAt: new Date().toISOString() } : h)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Restored household record",
          module: "Households",
          description: `${actor} restored household ${id} from archive.`,
        })
      },
    }),
    { name: "catarman-households-store-v2", storage: idbJSONStorage }
  )
)
