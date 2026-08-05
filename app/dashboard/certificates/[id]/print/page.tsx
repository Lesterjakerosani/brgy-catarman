"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { ShieldAlert } from "lucide-react"
import { CertificatePrintTemplate } from "@/components/dashboard/certificates/certificate-print-template"
import { useCertificatesStore } from "@/lib/stores/certificates-store"

export default function CertificatePrintPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const certificateRequests = useCertificatesStore((s) => s.certificateRequests)
  const request = certificateRequests.find((r) => r.id === params.id)

  if (!request) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <EmptyState icon={ShieldAlert} title="Request not found" description="This certificate request may have been deleted." />
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
        <CertificatePrintTemplate request={request} />
      </div>
    </div>
  )
}
