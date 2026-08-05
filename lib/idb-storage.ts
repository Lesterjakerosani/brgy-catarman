import { get, set, del } from "idb-keyval"
import { createJSONStorage, type StateStorage } from "zustand/middleware"
import toast from "react-hot-toast"

/**
 * IndexedDB-backed storage for zustand's persist middleware. localStorage has
 * a hard ~5-10MB per-origin quota shared across every persisted store, which
 * this app's photo/attachment uploads (stored as base64 data URLs) can blow
 * past on their own. IndexedDB's quota is a large fraction of free disk space
 * instead, which comfortably fits real usage.
 *
 * Any value already saved under a given key from before this migration (i.e.
 * still sitting in localStorage) is copied over to IndexedDB the first time
 * it's read, then removed from localStorage to free that space back up.
 */
const idbStateStorage: StateStorage = {
  getItem: async (name) => {
    const idbValue = await get<string>(name)
    if (idbValue !== undefined) return idbValue

    if (typeof localStorage !== "undefined") {
      const legacyValue = localStorage.getItem(name)
      if (legacyValue !== null) {
        try {
          await set(name, legacyValue)
          localStorage.removeItem(name)
        } catch {
          // IndexedDB unavailable (e.g. private browsing) -- keep using localStorage for now.
        }
        return legacyValue
      }
    }
    return null
  },
  setItem: async (name, value) => {
    try {
      await set(name, value)
    } catch {
      toast.error("That file is too large to save. Please use a smaller image and try again.")
    }
  },
  removeItem: async (name) => {
    await del(name)
  },
}

export const idbJSONStorage = createJSONStorage(() => idbStateStorage)
