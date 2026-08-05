"use client"

import * as React from "react"
import toast from "react-hot-toast"
import { Eye, Gavel, Printer } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { BlotterPrintTemplate } from "@/components/dashboard/blotters/blotter-print-template"
import type { Blotter } from "@/types"

const SAMPLE_BLOTTER: Blotter = {
  id: "sample",
  caseNumber: "BLT-2026-SAMPLE",
  incidentType: "Property Dispute",
  complainantName: "Juan Dela Cruz Santos",
  complainantAddress: "123 Rizal Street, Purok 1 - Poblacion, Barangay Catarman",
  complainantContact: "0917 234 5678",
  respondentName: "Pedro Reyes Bautista",
  respondentAddress: "45 Bonifacio Street, Purok 1 - Poblacion, Barangay Catarman",
  incidentDate: new Date().toISOString(),
  location: "Rizal Street, Purok 1 - Poblacion",
  narrative: "Sample narrative describing the nature of the dispute for template preview purposes. This section documents the complainant's account of the incident as recorded by the Lupon Secretary.",
  status: "Open",
  mediator: "Hon. Ramon Villanueva Cruz",
  hearings: [],
  isArchived: false,
  history: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const TEMPLATES = [
  {
    key: "standard",
    title: "Standard Blotter Report",
    description: "The default Katarungang Pambarangay blotter record used for all dispute mediation cases, including complainant/respondent details, narrative, and signature blocks.",
  },
]

export default function BlotterTemplatesPage() {
  const [previewing, setPreviewing] = React.useState(false)

  return (
    <div className="space-y-6">
      <PageHeader title="Blotter Templates" description="Preview the official layout used to generate printed blotter case records." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <Card key={template.key} className="flex flex-col border-border/70">
            <CardContent className="flex flex-1 flex-col p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Gavel className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold text-foreground">{template.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{template.description}</p>
              <Button variant="outline" className="mt-4" onClick={() => setPreviewing(true)}>
                <Eye className="size-4" />
                Preview Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={previewing} onOpenChange={setPreviewing}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Standard Blotter Report — Template Preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto rounded-xl bg-muted p-6">
            <BlotterPrintTemplate blotter={SAMPLE_BLOTTER} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewing(false)}>
              Close
            </Button>
            <Button onClick={() => { toast.success("Preparing print view..."); window.print() }}>
              <Printer className="size-4" />
              Print Sample
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
