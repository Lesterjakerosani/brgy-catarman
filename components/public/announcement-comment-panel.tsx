"use client"

import * as React from "react"
import { ChevronDown, Image as ImageIcon, Send, Smile } from "lucide-react"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { Input } from "@/components/ui/input"
import { CommentRow } from "@/components/public/comment-row"
import type { CommentAuthorRole, UserComment } from "@/lib/stores/engagement-store"
import type { SeededComment } from "@/lib/seeded-comments"

interface AnnouncementCommentPanelProps {
  announcementId: string
  comments: SeededComment[]
  myComments: UserComment[]
  viewerName: string
  viewerRole?: CommentAuthorRole
  onAddComment: (text: string) => void
  className?: string
}

export function AnnouncementCommentPanel({
  announcementId,
  comments,
  myComments,
  viewerName,
  viewerRole,
  onAddComment,
  className,
}: AnnouncementCommentPanelProps) {
  const [draft, setDraft] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = draft.trim()
    if (!value) return
    onAddComment(value)
    setDraft("")
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 py-2.5">
        <button type="button" className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          Most relevant
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-3">
        {[...myComments].reverse().map((c) => (
          <CommentRow
            key={c.id}
            id={c.id}
            name={c.authorName}
            role={c.authorRole}
            text={c.text}
            timeLabel="Just now"
            isYou
            viewerName={viewerName}
            viewerRole={viewerRole}
          />
        ))}

        {comments.map((c, i) => (
          <CommentRow
            key={`s-${i}`}
            id={`${announcementId}-s-${i}`}
            name={c.name}
            text={c.text}
            timeLabel={`${c.timeLabel} ago`}
            viewerName={viewerName}
            viewerRole={viewerRole}
          />
        ))}
      </div>

      <form onSubmit={submit} className="flex shrink-0 items-center gap-2 border-t border-border p-3">
        <InitialsAvatar name={viewerName} size="sm" />
        <div className="relative flex-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment..."
            className="h-9 rounded-full bg-secondary pr-16"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-muted-foreground">
            <Smile className="size-4" />
            <ImageIcon className="size-4" />
          </div>
        </div>
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Post comment"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary hover:bg-secondary disabled:opacity-30"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}
