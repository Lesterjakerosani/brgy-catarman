import type { EmergencyContact, Official } from "@/types"
import officialsJson from "./generated/officials.json"
import emergencyContactsJson from "./generated/emergency-contacts.json"

export const officials: Official[] = officialsJson as Official[]
export const emergencyContacts: EmergencyContact[] = emergencyContactsJson as EmergencyContact[]
