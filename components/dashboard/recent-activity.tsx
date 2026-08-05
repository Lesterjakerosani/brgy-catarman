"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLogsStore } from "@/lib/stores/logs-store"
import { formatRelativeTime } from "@/lib/format"
import { InitialsAvatar } from "@/components/shared/initials-avatar"

export function RecentActivity({ limit = 8 }: { limit?: number }) {
  const activityLogs = useLogsStore((s) => s.activityLogs)
  const recent = activityLogs.slice(0, limit)

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recent.map((log) => (
          <div key={log.id} className="flex items-start gap-3">
            <InitialsAvatar name={log.actorName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{log.actorName}</span> {log.action.toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                {log.module} · {formatRelativeTime(log.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
