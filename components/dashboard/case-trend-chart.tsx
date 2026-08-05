"use client"

import * as React from "react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCertificatesStore } from "@/lib/stores/certificates-store"
import { useComplaintsStore } from "@/lib/stores/complaints-store"
import { lastNMonthLabels, countByMonth } from "@/lib/chart-data"

const NAVY = "#0b2c5f"
const GOLD = "#c9a227"

export function CaseTrendChart() {
  const certificateRequests = useCertificatesStore((s) => s.certificateRequests)
  const complaints = useComplaintsStore((s) => s.complaints)

  const months = React.useMemo(() => lastNMonthLabels(6), [])

  const data = React.useMemo(() => {
    const requestCounts = countByMonth(certificateRequests, (r) => r.submittedAt, months)
    const complaintCounts = countByMonth(complaints, (c) => c.submittedAt, months)
    return months.map((m) => ({ month: m.label, "Requested Documents": requestCounts[m.key], Complaints: complaintCounts[m.key] }))
  }, [certificateRequests, complaints, months])

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Monthly Case Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Requested Documents" stroke={NAVY} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Complaints" stroke={GOLD} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
