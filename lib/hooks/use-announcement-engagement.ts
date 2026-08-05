"use client"

import * as React from "react"
import { useEngagementStore, type UserComment } from "@/lib/stores/engagement-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { buildSeededComments, seededInt } from "@/lib/seeded-comments"
import type { ReactionKey } from "@/components/public/reaction-icons"
import type { Announcement } from "@/types"

const EMPTY_COMMENTS: UserComment[] = []

export function useAnnouncementEngagement(announcement: Announcement) {
  const myComments = useEngagementStore((s) => s.userComments[announcement.id] ?? EMPTY_COMMENTS)
  const addUserComment = useEngagementStore((s) => s.addUserComment)
  const reaction = useEngagementStore((s) => s.postReactions[announcement.id] ?? null)
  const setPostReaction = useEngagementStore((s) => s.setPostReaction)
  const session = useAuthStore((s) => s.session)

  const likeCount = seededInt(announcement.id + "l", 6, 84) + (reaction ? 1 : 0)
  const shareCount = seededInt(announcement.id + "sh", 2, 40)
  const seededCommentCount = seededInt(announcement.id + "c", 0, 14)
  const seededComments = React.useMemo(
    () => buildSeededComments(announcement.id, seededCommentCount),
    [announcement.id, seededCommentCount]
  )
  const totalCommentCount = seededCommentCount + myComments.length

  const viewerName = session?.name ?? "You"
  const viewerRole = session?.role

  function pickReaction(key: ReactionKey) {
    setPostReaction(announcement.id, reaction === key ? null : key)
  }

  function addComment(text: string) {
    addUserComment(announcement.id, text, viewerName, viewerRole)
  }

  return {
    likeCount,
    shareCount,
    reaction,
    pickReaction,
    seededComments,
    myComments,
    totalCommentCount,
    addComment,
    viewerName,
    viewerRole,
  }
}
