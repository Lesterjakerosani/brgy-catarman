import type { Activity, Announcement } from "@/types"
import announcementsJson from "./generated/announcements.json"
import activitiesJson from "./generated/activities.json"

export const announcements: Announcement[] = announcementsJson as Announcement[]
export const activities: Activity[] = activitiesJson as Activity[]
