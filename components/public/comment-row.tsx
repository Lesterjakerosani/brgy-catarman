"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, Send, ThumbsUp } from "lucide-react"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { Input } from "@/components/ui/input"
import { REACTIONS, ReactionBubble, reactionByKey, type ReactionKey } from "@/components/public/reaction-icons"
import { AnnouncementReactionsDialog } from "@/components/public/announcement-reactions-dialog"
import { AuthorRoleBadge } from "@/components/public/author-role-badge"
import { useEngagementStore, type CommentAuthorRole, type EngagementReply } from "@/lib/stores/engagement-store"
import { useViewerKey } from "@/lib/hooks/use-viewer-key"
import { useStaffStore } from "@/lib/stores/staff-store"
import { seededInt } from "@/lib/seeded-comments"
import { cn } from "@/lib/utils"

const EMPTY_REPLIES: EngagementReply[] = []

interface CommentRowProps {
  id: string
  name: string
  role?: CommentAuthorRole
  text: string
  timeLabel: string
  authorViewerKey?: string
  viewerName: string
  viewerRole?: CommentAuthorRole
  /** True only inside the staff/admin dashboard -- see useAnnouncementEngagement. */
  isStaffContext?: boolean
  /** True only for the fake demo comments seeded to make the feed look populated.
   * Real, user-created comments must start at 0 reactions -- never a fabricated baseline. */
  isSeeded?: boolean
}

export function CommentRow({ id, name, role, text, timeLabel, authorViewerKey, viewerName, viewerRole, isStaffContext = false, isSeeded = false }: CommentRowProps) {
  const viewerKey = useViewerKey(!isStaffContext)
  const isYou = authorViewerKey !== undefined && authorViewerKey === viewerKey
  const staffMembers = useStaffStore((s) => s.staffMembers)
  const avatarFor = React.useCallback(
    (key?: string) => (key ? staffMembers.find((m) => m.id === key)?.avatarUrl : undefined),
    [staffMembers]
  )
  const reaction = useEngagementStore((s) => s.commentReactions[`${viewerKey}:${id}`] ?? null)
  const setCommentReactionRaw = useEngagementStore((s) => s.setCommentReaction)
  const replies = useEngagementStore((s) => s.commentReplies[id] ?? EMPTY_REPLIES)
  const addCommentReply = useEngagementStore((s) => s.addCommentReply)

  const [pickerOpen, setPickerOpen] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [replyOpen, setReplyOpen] = React.useState(false)
  const [replyDraft, setReplyDraft] = React.useState("")
  const [reactorsOpen, setReactorsOpen] = React.useState(false)
  const [repliesVisible, setRepliesVisible] = React.useState(false)

  const baseLikeCount = isSeeded ? seededInt(id + "cl", 0, 6) : 0
  const likeCount = baseLikeCount + (reaction ? 1 : 0)

  function openPicker() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setPickerOpen(true)
  }

  function scheduleClosePicker() {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 300)
  }

  function pickReaction(key: ReactionKey) {
    setCommentReactionRaw(viewerKey, id, reaction === key ? null : key)
    setPickerOpen(false)
  }

  function submitReply(e: React.FormEvent) {
    e.preventDefault()
    const value = replyDraft.trim()
    if (!value) return
    addCommentReply(id, value, viewerName, viewerRole, viewerKey)
    setReplyDraft("")
  }

  return (
    <div className="flex items-start gap-2">
      <InitialsAvatar name={name} photoUrl={avatarFor(authorViewerKey)} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="inline-block rounded-2xl bg-secondary px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            {name}
            {role ? <AuthorRoleBadge role={role} /> : null}
            {isYou && name !== "You" ? <span className="font-normal text-muted-foreground">(You)</span> : null}
          </p>
          <p className="text-sm text-foreground/90">{text}</p>
        </div>
        <div className="mt-1 ml-3 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
          <div className="relative" onMouseEnter={openPicker} onMouseLeave={scheduleClosePicker}>
            {pickerOpen ? (
              <div className="absolute bottom-full left-0 z-20 mb-1 flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-lg">
                {REACTIONS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => pickReaction(r.key)}
                    aria-label={r.label}
                    className="transition-transform duration-150 hover:-translate-y-1 hover:scale-125"
                  >
                    <ReactionBubble reaction={r.key} className="size-7" />
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => pickReaction("like")}
              className={cn("font-semibold hover:underline", reaction ? reactionByKey(reaction).labelColor : undefined)}
            >
              {reaction ? reactionByKey(reaction).label : "Like"}
            </button>
          </div>
          <button type="button" onClick={() => setReplyOpen((v) => !v)} className="hover:underline">
            Reply
          </button>
          <span>{timeLabel}</span>
          {likeCount > 0 ? (
            <button
              type="button"
              onClick={() => setReactorsOpen(true)}
              className="flex items-center gap-1 text-muted-foreground hover:underline"
            >
              {reaction ? (
                <ReactionBubble reaction={reaction} className="size-3.5" />
              ) : (
                <span className="flex size-3.5 items-center justify-center rounded-full bg-primary text-white">
                  <ThumbsUp className="size-2 fill-white" />
                </span>
              )}
              {likeCount}
            </button>
          ) : null}
        </div>

        {replies.length > 0 ? (
          <div className="mt-1 ml-3">
            <button
              type="button"
              onClick={() => setRepliesVisible((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:underline"
            >
              {repliesVisible ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {repliesVisible ? "Hide" : "View"} {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>

            {repliesVisible ? (
              <div className="mt-2 space-y-2">
                {replies.map((r) => (
                  <div key={r.id} className="flex items-start gap-2">
                    <InitialsAvatar name={r.name} photoUrl={avatarFor(r.viewerKey)} size="sm" />
                    <div className="inline-block rounded-2xl bg-secondary px-3 py-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        {r.name}
                        {r.role ? <AuthorRoleBadge role={r.role} /> : null}
                        {r.viewerKey === viewerKey && r.name !== "You" ? (
                          <span className="font-normal text-muted-foreground">(You)</span>
                        ) : null}
                      </p>
                      <p className="text-sm text-foreground/90">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {replyOpen ? (
          <form onSubmit={submitReply} className="mt-2 flex items-center gap-2">
            <InitialsAvatar name={viewerName} photoUrl={avatarFor(viewerKey)} size="sm" />
            <Input
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder={`Reply to ${name}...`}
              className="h-8 flex-1 rounded-full bg-secondary text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyDraft.trim()}
              aria-label="Post reply"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-primary hover:bg-secondary disabled:opacity-30"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        ) : null}
      </div>

      <AnnouncementReactionsDialog
        open={reactorsOpen}
        onOpenChange={setReactorsOpen}
        seedId={id}
        totalCount={likeCount}
        userReaction={reaction}
      />
    </div>
  )
}
