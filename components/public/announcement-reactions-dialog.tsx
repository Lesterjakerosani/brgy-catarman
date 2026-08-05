"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ReactionBubble, type ReactionKey } from "@/components/public/reaction-icons"
import { cn } from "@/lib/utils"

function seededInt(seed: string, min: number, max: number) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return min + (hash % (max - min + 1))
}

interface Reactor {
  name: string
  reaction: ReactionKey
  isYou?: boolean
}

export function reactionBreakdown(id: string, total: number, userReaction: ReactionKey | null) {
  const loveShare = seededInt(id + "lv", 15, 35)
  const hahaShare = seededInt(id + "ha", 5, 20)
  const loveCount = Math.max(1, Math.round((total * loveShare) / 100))
  const hahaCount = Math.max(1, Math.round((total * hahaShare) / 100))
  const likeCount = Math.max(0, total - loveCount - hahaCount)

  const counts: Partial<Record<ReactionKey, number>> = { like: likeCount, love: loveCount, haha: hahaCount }
  if (userReaction && !counts[userReaction]) counts[userReaction] = 1

  return (Object.entries(counts) as [ReactionKey, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
}

function buildReactors(id: string, breakdown: [ReactionKey, number][], userReaction: ReactionKey | null): Reactor[] {
  const reactors: Reactor[] = []
  for (const [key, count] of breakdown) {
    const shown = Math.min(count, 15)
    for (let i = 0; i < shown; i++) {
      if (userReaction === key && i === 0) {
        reactors.push({ name: "You", reaction: key, isYou: true })
        continue
      }
      reactors.push({ name: "Resident", reaction: key })
    }
  }
  return reactors
}

interface AnnouncementReactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  seedId: string
  totalCount: number
  userReaction: ReactionKey | null
}

export function AnnouncementReactionsDialog({
  open,
  onOpenChange,
  seedId,
  totalCount,
  userReaction,
}: AnnouncementReactionsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | ReactionKey>("all")

  const breakdown = React.useMemo(
    () => reactionBreakdown(seedId, totalCount, userReaction),
    [seedId, totalCount, userReaction]
  )
  const allReactors = React.useMemo(() => buildReactors(seedId, breakdown, userReaction), [seedId, breakdown, userReaction])
  const visibleReactors = activeTab === "all" ? allReactors : allReactors.filter((r) => r.reaction === activeTab)

  React.useEffect(() => {
    if (open) setActiveTab("all")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[80vh] w-full max-w-sm flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground ring-0"
      >
        <DialogTitle className="sr-only">Reactions</DialogTitle>

        <div className="relative flex shrink-0 items-center gap-1 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "rounded-md px-2 py-1.5 text-sm font-semibold",
              activeTab === "all" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            All <span className="text-xs">{totalCount}</span>
          </button>
          {breakdown.map(([key, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-semibold",
                activeTab === key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <ReactionBubble reaction={key} className="size-4" />
              {count}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/70"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {visibleReactors.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary">
              <div className="relative">
                <InitialsAvatar name={r.name} size="md" />
                <ReactionBubble reaction={r.reaction} className="absolute -bottom-1 -right-1 size-4 ring-2 ring-card" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {r.name}
                {r.isYou ? <span className="ml-1 font-normal text-muted-foreground">(You)</span> : null}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
