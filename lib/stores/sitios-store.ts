import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { sitios as seedSitios, householdPuroks as seedPuroks } from "@/data/sitios"
import type { HouseholdPurok, Sitio } from "@/types"
import { useLogsStore } from "@/lib/stores/logs-store"

interface AddSitioResult {
  success: boolean
  error?: string
  sitio?: Sitio
}

interface SitiosState {
  sitios: Sitio[]
  puroks: HouseholdPurok[]
  addSitio: (name: string, actor: string) => AddSitioResult
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export const useSitiosStore = create<SitiosState>()(
  persist(
    (set, get) => ({
      sitios: seedSitios,
      puroks: seedPuroks,
      addSitio: (name, actor) => {
        const trimmed = name.trim()
        if (!trimmed) {
          return { success: false, error: "Sitio name cannot be empty." }
        }

        const isDuplicate = get().sitios.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
        if (isDuplicate) {
          return { success: false, error: "A sitio with this name already exists." }
        }

        const existingIds = new Set(get().sitios.map((s) => s.id))
        const baseSlug = slugify(trimmed) || "sitio"
        let id = `sitio-${baseSlug}`
        let suffix = 2
        while (existingIds.has(id)) {
          id = `sitio-${baseSlug}-${suffix}`
          suffix += 1
        }

        const sitio: Sitio = { id, name: trimmed }
        const purok: HouseholdPurok = { id: `${id}-purok-1`, sitioId: id, name: "Purok 1" }

        set((state) => ({ sitios: [...state.sitios, sitio], puroks: [...state.puroks, purok] }))

        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Added new sitio",
          module: "Households",
          description: `${actor} created sitio "${trimmed}".`,
        })

        return { success: true, sitio }
      },
    }),
    { name: "catarman-sitios-store-v1", storage: idbJSONStorage }
  )
)
