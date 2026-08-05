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
}

export interface UserComment {
  id: string
  text: string
  authorName: string
  authorRole?: CommentAuthorRole
  createdAt: string
}

interface EngagementState {
  postReactions: Record<string, ReactionKey>
  commentReactions: Record<string, ReactionKey>
  userComments: Record<string, UserComment[]>
  commentReplies: Record<string, EngagementReply[]>
  setPostReaction: (announcementId: string, reaction: ReactionKey | null) => void
  setCommentReaction: (commentId: string, reaction: ReactionKey | null) => void
  addUserComment: (announcementId: string, text: string, authorName: string, authorRole?: CommentAuthorRole) => void
  addCommentReply: (commentId: string, text: string, authorName: string, authorRole?: CommentAuthorRole) => void
  renameAuthor: (oldName: string, newName: string) => void
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set) => ({
      postReactions: {},
      commentReactions: {},
      userComments: {},
      commentReplies: {},
      setPostReaction: (announcementId, reaction) =>
        set((state) => {
          const next = { ...state.postReactions }
          if (reaction) next[announcementId] = reaction
          else delete next[announcementId]
          return { postReactions: next }
        }),
      setCommentReaction: (commentId, reaction) =>
        set((state) => {
          const next = { ...state.commentReactions }
          if (reaction) next[commentId] = reaction
          else delete next[commentId]
          return { commentReactions: next }
        }),
      addUserComment: (announcementId, text, authorName, authorRole) =>
        set((state) => {
          const existing = state.userComments[announcementId] ?? []
          const comment: UserComment = {
            id: `${announcementId}-m-${existing.length}`,
            text,
            authorName,
            authorRole,
            createdAt: new Date().toISOString(),
          }
          return {
            userComments: {
              ...state.userComments,
              [announcementId]: [...existing, comment],
            },
          }
        }),
      addCommentReply: (commentId, text, authorName, authorRole) =>
        set((state) => {
          const existing = state.commentReplies[commentId] ?? []
          const reply: EngagementReply = {
            id: `${commentId}-r-${existing.length}`,
            name: authorName,
            role: authorRole,
            text,
            createdAt: new Date().toISOString(),
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
    { name: "catarman-engagement-store", storage: idbJSONStorage }
  )
)
