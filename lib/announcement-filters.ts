import type { Announcement, AnnouncementCategory } from "@/types"

export type AnnouncementSort = "newest" | "oldest" | "pinned"
export type AnnouncementMediaFilter = "all" | "photos" | "videos"

export interface AnnouncementFilterState {
  query: string
  sort: AnnouncementSort
  category: AnnouncementCategory | "all"
  media: AnnouncementMediaFilter
}

export const DEFAULT_ANNOUNCEMENT_FILTERS: AnnouncementFilterState = {
  query: "",
  sort: "pinned",
  category: "all",
  media: "all",
}

function hasVideo(a: Announcement) {
  return (a.mediaUrls ?? []).some((url) => url.startsWith("data:video/"))
}

function hasPhoto(a: Announcement) {
  return (a.mediaUrls ?? []).some((url) => !url.startsWith("data:video/"))
}

export function filterAnnouncements(items: Announcement[], filters: AnnouncementFilterState): Announcement[] {
  const query = filters.query.trim().toLowerCase()

  let result = items.filter((a) => {
    if (query && !a.title.toLowerCase().includes(query) && !a.excerpt.toLowerCase().includes(query)) return false
    if (filters.category !== "all" && a.category !== filters.category) return false
    if (filters.media === "photos" && !hasPhoto(a)) return false
    if (filters.media === "videos" && !hasVideo(a)) return false
    return true
  })

  result = [...result].sort((a, b) => {
    if (filters.sort === "pinned") {
      const pinDiff = (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
      if (pinDiff !== 0) return pinDiff
      return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
    }
    const diff = new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
    return filters.sort === "oldest" ? -diff : diff
  })

  return result
}
