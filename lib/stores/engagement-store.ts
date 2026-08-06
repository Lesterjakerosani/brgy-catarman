import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import type { ReactionKey } from "@/components/public/reaction-icons"

export type CommentAuthorRole = "Staff" | "Administrator"

export interface EngagementReply {
  id: string
  name: string
  role?: CommentAuthorRole
  text: string
  createdAt: string
  /** The poster's viewer key (see useViewerKey), used to correctly show "(You)"
   * only to the account that actually posted this reply. */
  viewerKey?: string
}

export interface UserComment {
  id: string
  text: string
  authorName: string
  authorRole?: CommentAuthorRole
  createdAt: string
  /** The poster's viewer key (see useViewerKey), used to correctly show "(You)"
   * only to the account that actually posted this comment. */
  viewerKey?: string
}

/** Reaction maps are keyed by `${viewerKey}:${postOrCommentId}` so each
 * viewer's reaction is independent -- see useViewerKey. */
function reactionKey(viewerKey: string, id: string): string {
  return `${viewerKey}:${id}`
}

interface EngagementState {
  postReactions: Record<string, ReactionKey>
  commentReactions: Record<string, ReactionKey>
  userComments: Record<string, UserComment[]>
  commentReplies: Record<string, EngagementReply[]>
  setPostReaction: (viewerKey: string, announcementId: string, reaction: ReactionKey | null) => void
  setCommentReaction: (viewerKey: string, commentId: string, reaction: ReactionKey | null) => void
  addUserComment: (announcementId: string, text: string, authorName: string, authorRole: CommentAuthorRole | undefined, viewerKey: string) => void
  addCommentReply: (commentId: string, text: string, authorName: string, authorRole: CommentAuthorRole | undefined, viewerKey: string) => void
  renameAuthor: (oldName: string, newName: string) => void
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set) => ({
      postReactions: {},
      commentReactions: {},
      userComments: {},
      commentReplies: {},
      setPostReaction: (viewerKey, announcementId, reaction) =>
        set((state) => {
          const key = reactionKey(viewerKey, announcementId)
          const next = { ...state.postReactions }
          if (reaction) next[key] = reaction
          else delete next[key]
          return { postReactions: next }
        }),
      setCommentReaction: (viewerKey, commentId, reaction) =>
        set((state) => {
          const key = reactionKey(viewerKey, commentId)
          const next = { ...state.commentReactions }
          if (reaction) next[key] = reaction
          else delete next[key]
          return { commentReactions: next }
        }),
      addUserComment: (announcementId, text, authorName, authorRole, viewerKey) =>
        set((state) => {
          const existing = state.userComments[announcementId] ?? []
          const comment: UserComment = {
            id: `${announcementId}-m-${existing.length}`,
            text,
            authorName,
            authorRole,
            createdAt: new Date().toISOString(),
            viewerKey,
          }
          return {
            userComments: {
              ...state.userComments,
              [announcementId]: [...existing, comment],
            },
          }
        }),
      addCommentReply: (commentId, text, authorName, authorRole, viewerKey) =>
        set((state) => {
          const existing = state.commentReplies[commentId] ?? []
          const reply: EngagementReply = {
            id: `${commentId}-r-${existing.length}`,
            name: authorName,
            role: authorRole,
            text,
            createdAt: new Date().toISOString(),
            viewerKey,
          }
          return {
            commentReplies: {
              ...state.commentReplies,
              [commentId]: [...existing, reply],
            },
          }
        }),
      renameAuthor: (oldName, newName) =>
        set((state) => ({
          userComments: Object.fromEntries(
            Object.entries(state.userComments).map(([announcementId, comments]) => [
              announcementId,
              comments.map((c) => (c.authorRole && c.authorName === oldName ? { ...c, authorName: newName } : c)),
            ])
          ),
          commentReplies: Object.fromEntries(
            Object.entries(state.commentReplies).map(([commentId, replies]) => [
              commentId,
              replies.map((r) => (r.role && r.name === oldName ? { ...r, name: newName } : r)),
            ])
          ),
        })),
    }),
    {
      name: "catarman-engagement-store",
      storage: idbJSONStorage,
      version: 1,
      migrate: (persisted) => {
        const state = persisted as EngagementState
        // Older versions stored anonymous residents' name as the literal
        // string "You" -- a viewer-relative word baked in as permanent data,
        // which made every future viewer (including staff/admin) see it as
        // if it were their own comment. Correct any already-saved records.
        if (state?.userComments) {
          state.userComments = Object.fromEntries(
            Object.entries(state.userComments).map(([announcementId, comments]) => [
              announcementId,
              comments.map((c) => (!c.authorRole && c.authorName === "You" ? { ...c, authorName: "Resident" } : c)),
            ])
          )
        }
        if (state?.commentReplies) {
          state.commentReplies = Object.fromEntries(
            Object.entries(state.commentReplies).map(([commentId, replies]) => [
              commentId,
              replies.map((r) => (!r.role && r.name === "You" ? { ...r, name: "Resident" } : r)),
            ])
          )
        }
        return state
      },
    }
  )
)
