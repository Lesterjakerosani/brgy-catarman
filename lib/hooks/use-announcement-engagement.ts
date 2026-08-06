"use client"

import * as React from "react"
import { useEngagementStore, type UserComment } from "@/lib/stores/engagement-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useViewerKey } from "@/lib/hooks/use-viewer-key"
import { buildSeededComments, seededInt } from "@/lib/seeded-comments"
import { announcements as seedAnnouncements } from "@/data/announcements"
import type { ReactionKey } from "@/components/public/reaction-icons"
import type { Announcement } from "@/types"

const EMPTY_COMMENTS: UserComment[] = []

/** IDs of the original static demo announcements -- only these get fabricated
 * "populated" like/comment counts. Announcements created through the app
 * (real, generateId-based IDs) must start at 0, not a fake baseline. */
const SEEDED_ANNOUNCEMENT_IDS = new Set(seedAnnouncements.map((a) => a.id))

/**
 * @param isStaffContext Pass true only when rendered inside the staff/admin
 * dashboard. The app has one shared login session with no per-portal scoping,
 * so without this flag a staff/admin merely being logged in would have their
 * identity attached to content posted through the public site. Defaults to
 * false (anonymous) so the safe behavior is the one you get by omission.
 */
export function useAnnouncementEngagement(announcement: Announcement, isStaffContext: boolean = false) {
  const viewerKey = useViewerKey(!isStaffContext)
  const myComments = useEngagementStore((s) => s.userComments[announcement.id] ?? EMPTY_COMMENTS)
  const addUserComment = useEngagementStore((s) => s.addUserComment)
  const reaction = useEngagementStore((s) => s.postReactions[`${viewerKey}:${announcement.id}`] ?? null)
  const setPostReactionRaw = useEngagementStore((s) => s.setPostReaction)
  const session = useAuthStore((s) => s.session)
  const effectiveSession = isStaffContext ? session : null

  const isSeededAnnouncement = SEEDED_ANNOUNCEMENT_IDS.has(announcement.id)
  const likeCount = (isSeededAnnouncement ? seededInt(announcement.id + "l", 6, 84) : 0) + (reaction ? 1 : 0)
  const seededCommentCount = isSeededAnnouncement ? seededInt(announcement.id + "c", 0, 14) : 0
  const seededComments = React.useMemo(
    () => (isSeededAnnouncement ? buildSeededComments(announcement.id, seededCommentCount) : []),
    [isSeededAnnouncement, announcement.id, seededCommentCount]
  )
  const totalCommentCount = seededCommentCount + myComments.length

  // "Resident" -- not "You" -- since this name gets permanently stored on the
  // comment/reply record. "You" is inherently relative to whoever is looking;
  // baking it in as a literal name would make it read as "yours" to every
  // future viewer, not just the person who actually posted it. The "(You)"
  // suffix (computed live per-viewer via isYou in CommentRow) is what
  // correctly shows only to the original poster.
  const viewerName = effectiveSession?.name ?? "Resident"
  const viewerRole = effectiveSession?.role

  function pickReaction(key: ReactionKey) {
    setPostReactionRaw(viewerKey, announcement.id, reaction === key ? null : key)
  }

  function addComment(text: string) {
    addUserComment(announcement.id, text, viewerName, viewerRole, viewerKey)
  }

  return {
    likeCount,
    reaction,
    pickReaction,
    seededComments,
    myComments,
    totalCommentCount,
    addComment,
    viewerName,
    viewerRole,
    viewerKey,
  }
}
