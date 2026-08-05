import type { StaffMember } from "@/types"
import staffJson from "./generated/staff.json"

export const staffMembers: StaffMember[] = staffJson as StaffMember[]
