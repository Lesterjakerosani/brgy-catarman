import type { Complaint } from "@/types"
import complaintsJson from "./generated/complaints.json"

export const complaints: Complaint[] = complaintsJson as Complaint[]

export const INCIDENT_CATEGORIES = [
  "Loitering",
  "Noise Complaint",
  "Illegal Parking",
  "Public Disturbance",
  "Illegal Dumping",
  "Vandalism",
  "Other",
] as const
