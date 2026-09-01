"use client"

import * as React from "react"
import { CalendarDays, CalendarRange, PhilippinePeso, Wallet } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useRevenueAnalytics, type RevenueBreakdownRow } from "@/lib/api/hooks/use-dashboard"
import { formatCurrency } from "@/lib/format"

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "allTime", label: "All Time" },
] as const

type PeriodValue = (typeof PERIODS)[number]["value"]

export default function AnalyticsPage() {
  const { revenue, isLoading } = useRevenueAnalytics()
  const [period, setPeriod] = React.useState<PeriodValue>("today")

  const totals = revenue?.totals
  const rows: RevenueBreakdownRow[] = revenue?.breakdown[period] ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue from completed document requests — counted only once a document has been claimed."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Revenue" value={isLoading ? "—" : formatCurrency(totals?.today)} icon={CalendarDays} accent="navy" />
        <StatCard label="Monthly Revenue" value={isLoading ? "—" : formatCurrency(totals?.month)} icon={CalendarRange} accent="gold" />
        <StatCard label="Yearly Revenue" value={isLoading ? "—" : formatCurrency(totals?.year)} icon={Wallet} accent="success" />
        <StatCard label="All-Time Revenue" value={isLoading ? "—" : formatCurrency(totals?.allTime)} icon={PhilippinePeso} accent="navy" />
      </div>

      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Revenue Breakdown by Document Type</p>
            <p className="text-xs text-muted-foreground">Only successfully claimed/released documents are counted as revenue.</p>
          </div>

          <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodValue)}>
            <TabsList>
              {PERIODS.map((p) => (
                <TabsTrigger key={p.value} value={p.value}>
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {PERIODS.map((p) => (
              <TabsContent key={p.value} value={p.value}>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Completed Transactions</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                            {isLoading ? "Loading..." : "No completed transactions for this period."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row) => (
                          <TableRow key={row.documentTypeId}>
                            <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                            <TableCell>{formatCurrency(row.price)}</TableCell>
                            <TableCell>{row.count}</TableCell>
                            <TableCell className="text-right font-semibold text-foreground">{formatCurrency(row.revenue)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
