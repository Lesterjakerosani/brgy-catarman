import type { ActivityLog, AppNotification, BackupRecord } from "@/types"
import activityLogsJson from "./generated/activity-logs.json"
import notificationsJson from "./generated/notifications.json"

export const activityLogs: ActivityLog[] = activityLogsJson as ActivityLog[]
export const notifications: AppNotification[] = notificationsJson as AppNotification[]

export const backupRecords: BackupRecord[] = [
  { id: "bkp-005", fileName: "catarman_backup_2026-08-03_0300.sql.gz", sizeMb: 42.8, type: "Automatic", status: "Completed", createdBy: "System", createdAt: "2026-08-03T03:00:00+08:00" },
  { id: "bkp-004", fileName: "catarman_backup_2026-08-02_0300.sql.gz", sizeMb: 42.6, type: "Automatic", status: "Completed", createdBy: "System", createdAt: "2026-08-02T03:00:00+08:00" },
  { id: "bkp-003", fileName: "catarman_backup_2026-08-01_1420.sql.gz", sizeMb: 42.5, type: "Manual", status: "Completed", createdBy: "System Administrator", createdAt: "2026-08-01T14:20:00+08:00" },
  { id: "bkp-002", fileName: "catarman_backup_2026-08-01_0300.sql.gz", sizeMb: 42.4, type: "Automatic", status: "Completed", createdBy: "System", createdAt: "2026-08-01T03:00:00+08:00" },
  { id: "bkp-001", fileName: "catarman_backup_2026-07-31_0300.sql.gz", sizeMb: 41.9, type: "Automatic", status: "Failed", createdBy: "System", createdAt: "2026-07-31T03:00:00+08:00" },
]
