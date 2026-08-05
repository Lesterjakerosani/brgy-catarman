import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { useStaffStore } from "@/lib/stores/staff-store"
import type { AuthSession } from "@/types"
import { useLogsStore } from "@/lib/stores/logs-store"
import { DEMO_PASSWORD } from "@/lib/auth-constants"

export { DEMO_PASSWORD }

interface AuthState {
  session: AuthSession | null
  login: (email: string, password: string, rememberMe: boolean) => { success: boolean; error?: string }
  logout: () => void
  logoutEverywhere: () => void
  updateSessionProfile: (patch: Partial<Pick<AuthSession, "avatarUrl" | "name">>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      login: (email, password) => {
        const staff = useStaffStore.getState().staffMembers.find((s) => s.email.toLowerCase() === email.trim().toLowerCase())
        if (!staff) {
          return { success: false, error: "No staff account found with that email address." }
        }
        if (staff.status === "Disabled") {
          return { success: false, error: "This account has been disabled. Please contact your administrator." }
        }
        const expectedPassword = staff.password ?? DEMO_PASSWORD
        if (password !== expectedPassword) {
          useLogsStore.getState().addLog({
            actorName: staff.name,
            actorRole: staff.role,
            action: "Failed login attempt",
            module: "Authentication",
            description: `Failed login attempt for ${staff.email}.`,
            status: "Failed",
          })
          return { success: false, error: "Incorrect password. Please try again." }
        }
        set({
          session: {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            avatarUrl: staff.avatarUrl,
            position: staff.position,
          },
        })
        useLogsStore.getState().addLog({
          actorName: staff.name,
          actorRole: staff.role,
          action: "Logged in",
          module: "Authentication",
          description: `${staff.name} logged in to the system.`,
        })
        return { success: true }
      },
      logout: () => {
        set((state) => {
          if (state.session) {
            useLogsStore.getState().addLog({
              actorName: state.session.name,
              actorRole: state.session.role,
              action: "Logged out",
              module: "Authentication",
              description: `${state.session.name} logged out of the system.`,
            })
          }
          return { session: null }
        })
      },
      logoutEverywhere: () => {
        set((state) => {
          if (state.session) {
            useLogsStore.getState().addLog({
              actorName: state.session.name,
              actorRole: state.session.role,
              action: "Logged out",
              module: "Authentication",
              description: `${state.session.name} terminated all active sessions.`,
            })
          }
          return { session: null }
        })
      },
      updateSessionProfile: (patch) => {
        set((state) => (state.session ? { session: { ...state.session, ...patch } } : state))
      },
    }),
    { name: "catarman-auth-store", storage: idbJSONStorage }
  )
)
