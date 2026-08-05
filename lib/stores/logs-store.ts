import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { activityLogs as seedLogs, notifications as seedNotifications } from "@/data/logs"
import type { ActivityLog, AppNotification } from "@/types"
import { generateId } from "@/lib/ids"

interface LogsState {
  activityLogs: ActivityLog[]
  notifications: AppNotification[]
  addLog: (entry: {
    actorName: string
    actorRole: ActivityLog["actorRole"]
    action: string
    module: ActivityLog["module"]
    description: string
    status?: ActivityLog["status"]
  }) => void
  addNotification: (entry: { title: string; message: string; type: AppNotification["type"]; link?: string }) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

export const useLogsStore = create<LogsState>()(
  persist(
    (set) => ({
      activityLogs: seedLogs,
      notifications: seedNotifications,
      addLog: (entry) =>
        set((state) => ({
          activityLogs: [
            {
              id: generateId("log"),
              ipAddress: "127.0.0.1",
              browser: typeof navigator !== "undefined" ? navigator.userAgent.split(" ").slice(-1)[0] : "Unknown",
              status: "Success",
              timestamp: new Date().toISOString(),
              ...entry,
            },
            ...state.activityLogs,
          ],
        })),
      addNotification: (entry) =>
        set((state) => ({
          notifications: [
            {
              id: generateId("ntf"),
              isRead: false,
              createdAt: new Date().toISOString(),
              ...entry,
            },
            ...state.notifications,
          ],
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
    }),
    { name: "catarman-logs-store", storage: idbJSONStorage }
  )
)
