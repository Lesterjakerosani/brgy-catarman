import type { Household } from "@/types"
import { householdPuroks } from "@/data/sitios"
import householdsJson from "./generated/households.json"

interface LegacyHousehold {
  id: string
  householdNumber: string
  headResidentId: string
  memberIds: string[]
  contactNumber: string
  classification: Household["classification"]
  is4PsBeneficiary: boolean
  createdAt: string
  updatedAt: string
  address: { street: string; houseNumber: string }
}

// The generated seed data predates the Sitio/Purok hierarchy, so each legacy
// household is deterministically assigned to one of the 9 puroks (3 sitios x
// 3 puroks) here rather than re-running the whole seed generator.
export const households: Household[] = (householdsJson as unknown as LegacyHousehold[]).map((h, index) => {
  const purok = householdPuroks[index % householdPuroks.length]
  return {
    id: h.id,
    householdNumber: h.householdNumber,
    sitioId: purok.sitioId,
    purokId: purok.id,
    address: { street: h.address.street, houseNumber: h.address.houseNumber },
    headResidentId: h.headResidentId,
    memberIds: h.memberIds,
    contactNumber: h.contactNumber,
    classification: h.classification,
    is4PsBeneficiary: h.is4PsBeneficiary,
    isArchived: false,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  }
})
