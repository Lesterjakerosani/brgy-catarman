"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { BlotterPrintTemplate } from "@/components/dashboard/blotters/blotter-print-template"
import { useBlottersStore } from "@/lib/stores/blotters-store"

export default function BlotterPrintPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const blotters = useBlottersStore((s) => s.blotters)
  const blotter = blotters.find((b) => b.id === params.id)

  if (!blotter) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <EmptyState icon={ShieldAlert} title="Case not found" description="This blotter case may have been deleted." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" />
          Print
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-muted p-6 print:overflow-visible print:bg-transparent print:p-0">
        <BlotterPrintTemplate blotter={blotter} />
      </div>
    </div>
  )
}
