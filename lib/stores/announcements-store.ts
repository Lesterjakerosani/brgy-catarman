import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { announcements as seedAnnouncements } from "@/data/announcements"
import type { Announcement, AnnouncementFormValues } from "@/types"
import { generateId } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"

interface AnnouncementsState {
  announcements: Announcement[]
  addAnnouncement: (values: AnnouncementFormValues, actor: string) => Announcement
  updateAnnouncement: (id: string, values: AnnouncementFormValues, actor: string) => void
  deleteAnnouncement: (id: string, actor: string) => void
  togglePin: (id: string, actor: string) => void
}

function makeExcerpt(html: string): string {
  const stripped = html.replace(/<[^>]*>/g, " ")
  const el = document.createElement("div")
  el.innerHTML = stripped
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim()
  return text.length > 140 ? `${text.slice(0, 140)}...` : text
}

export const useAnnouncementsStore = create<AnnouncementsState>()(
  persist(
    (set) => ({
      announcements: seedAnnouncements,
      addAnnouncement: (values, actor) => {
        const now = new Date().toISOString()
        const announcement: Announcement = {
          id: generateId("ann"),
          title: values.title,
          content: values.content,
          excerpt: makeExcerpt(values.content),
          imageUrl: values.imageUrl,
          mediaUrls: values.mediaUrls,
          attachments: values.attachments,
          category: values.category,
          isPinned: values.isPinned,
          status: values.status,
          publishAt: values.publishAt,
          author: actor,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ announcements: [announcement, ...state.announcements] }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Published announcement",
          module: "Announcements",
          description: `${actor} created announcement "${announcement.title}".`,
        })
        return announcement
      },
      updateAnnouncement: (id, values, actor) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id
              ? {
                  ...a,
                  title: values.title,
                  content: values.content,
                  excerpt: makeExcerpt(values.content),
                  imageUrl: values.imageUrl,
                  mediaUrls: values.mediaUrls,
                  attachments: values.attachments,
                  category: values.category,
                  isPinned: values.isPinned,
                  status: values.status,
                  publishAt: values.publishAt,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Edited announcement",
          module: "Announcements",
          description: `${actor} edited announcement ${id}.`,
        })
      },
      deleteAnnouncement: (id, actor) => {
        set((state) => ({ announcements: state.announcements.filter((a) => a.id !== id) }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Deleted announcement",
          module: "Announcements",
          description: `${actor} deleted announcement ${id}.`,
        })
      },
      togglePin: (id, actor) => {
        set((state) => ({
          announcements: state.announcements.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Pinned announcement",
          module: "Announcements",
          description: `${actor} toggled pin state for announcement ${id}.`,
        })
      },
    }),
    { name: "catarman-announcements-store", storage: idbJSONStorage }
  )
)
