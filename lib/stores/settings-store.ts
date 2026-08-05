import { create } from "zustand"
import { persist } from "zustand/middleware"
import { systemSettings as seedSettings } from "@/data/settings"
import { officials as seedOfficials, emergencyContacts as seedEmergencyContacts } from "@/data/officials"
import { backupRecords as seedBackupRecords } from "@/data/logs"
import type { BackupRecord, EmergencyContact, Official, SystemSettings } from "@/types"
import { generateId } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"
import { idbJSONStorage } from "@/lib/idb-storage"

interface SettingsState {
  settings: SystemSettings
  officials: Official[]
  emergencyContacts: EmergencyContact[]
  backupRecords: BackupRecord[]
  updateSettings: (values: Partial<SystemSettings>, actor: string) => void
  updateOfficial: (id: string, values: Partial<Official>, actor: string) => void
  addOfficial: (values: Omit<Official, "id">, actor: string) => Official
  deleteOfficial: (id: string, actor: string) => void
  runManualBackup: (actor: string) => BackupRecord
  restoreBackup: (id: string, actor: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: seedSettings,
      officials: seedOfficials,
      emergencyContacts: seedEmergencyContacts,
      backupRecords: seedBackupRecords,
      updateSettings: (values, actor) => {
        set((state) => ({ settings: { ...state.settings, ...values } }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Updated barangay information",
          module: "Settings",
          description: `${actor} updated system settings.`,
        })
      },
      updateOfficial: (id, values, actor) => {
        set((state) => ({
          officials: state.officials.map((o) => (o.id === id ? { ...o, ...values } : o)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Updated barangay official record",
          module: "Settings",
          description: `${actor} updated official ${id}.`,
        })
      },
      addOfficial: (values, actor) => {
        const official: Official = { id: generateId("off"), ...values }
        set((state) => ({ officials: [...state.officials, official].sort((a, b) => a.order - b.order) }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Added barangay official",
          module: "Settings",
          description: `${actor} added official ${official.name}.`,
        })
        return official
      },
      deleteOfficial: (id, actor) => {
        set((state) => ({ officials: state.officials.filter((o) => o.id !== id) }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Removed barangay official",
          module: "Settings",
          description: `${actor} removed official ${id}.`,
        })
      },
      runManualBackup: (actor) => {
        const record: BackupRecord = {
          id: generateId("bkp"),
          fileName: `catarman_backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.sql.gz`,
          sizeMb: Number((40 + Math.random() * 6).toFixed(1)),
          type: "Manual",
          status: "Completed",
          createdBy: actor,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ backupRecords: [record, ...state.backupRecords] }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Initiated manual backup",
          module: "Backup",
          description: `${actor} triggered a manual database backup (${record.fileName}).`,
        })
        return record
      },
      restoreBackup: (id, actor) => {
        const backup = get().backupRecords.find((b) => b.id === id)
        if (!backup) return
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Administrator",
          action: "Restored from backup",
          module: "Backup",
          description: `${actor} restored the system from backup ${backup.fileName}.`,
        })
      },
    }),
    { name: "catarman-settings-store", storage: idbJSONStorage }
  )
)
