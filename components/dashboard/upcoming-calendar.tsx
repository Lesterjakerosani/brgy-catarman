"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { activities } from "@/data/announcements"
import { formatDate } from "@/lib/format"
import { CalendarDays } from "lucide-react"

export function UpcomingCalendar() {
  const eventDates = React.useMemo(() => activities.map((a) => new Date(a.startDate)), [])

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Barangay Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <Calendar mode="multiple" selected={eventDates} defaultMonth={eventDates[0]} className="rounded-lg border border-border p-2" />
        <div className="flex-1 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(activity.startDate)} · {activity.location}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
