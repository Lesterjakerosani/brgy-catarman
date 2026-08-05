"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { ArrowLeft, Download, Eye, Plus, Printer, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CertificateDocumentEditor } from "@/components/dashboard/certificate-templates/certificate-document-editor"
import { CertificatePreviewPaper } from "@/components/dashboard/certificate-templates/certificate-preview-paper"
import { TemplateSettingsBar } from "@/components/dashboard/certificate-templates/template-settings-bar"
import { CertificatePreviewDialog } from "@/components/dashboard/certificate-templates/mobile-preview-sheet"
import { useCertificateTemplatesStore } from "@/lib/stores/certificate-templates-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { getDefaultTemplateBodyHtml } from "@/data/certificate-template-defaults"
import { exportElementAsPdf } from "@/lib/export-pdf"
import type { CertificateTemplate, CertificateTemplateStatus, CertificateTemplateType } from "@/types"

function blankDraft(type: CertificateTemplateType = "Certificate of Residency") {
  return {
    name: `${type} Template`,
    type,
    status: "Active" as CertificateTemplateStatus,
    requireResidentPhoto: true,
    showBarangayLogo: true,
    showBarangayDrySeal: true,
    bodyHtml: getDefaultTemplateBodyHtml(type),
  }
}

export default function CertificateTemplatesPage() {
  const router = useRouter()
  const templates = useCertificateTemplatesStore((s) => s.templates)
  const addTemplate = useCertificateTemplatesStore((s) => s.addTemplate)
  const updateTemplate = useCertificateTemplatesStore((s) => s.updateTemplate)
  const session = useAuthStore((s) => s.session)

  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(templates[0]?.id ?? null)
  const [draft, setDraft] = React.useState(() => (templates[0] ? { ...templates[0] } : blankDraft()))
  const [resetConfirmOpen, setResetConfirmOpen] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const printPaperRef = React.useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = React.useState(false)

  function loadTemplate(template: CertificateTemplate) {
    setSelectedTemplateId(template.id)
    setDraft({ ...template })
  }

  function handleSelectTemplate(id: string) {
    const template = templates.find((t) => t.id === id)
    if (template) loadTemplate(template)
  }

  function handleNewTemplate() {
    setSelectedTemplateId(null)
    setDraft(blankDraft())
    toast.success("Started a new blank template.")
  }

  function handleCancel() {
    if (selectedTemplateId) {
      const original = templates.find((t) => t.id === selectedTemplateId)
      if (original) setDraft({ ...original })
    } else {
      setDraft(blankDraft(draft.type))
    }
    toast.success("Changes discarded.")
  }

  function handleReset() {
    setDraft((prev) => ({ ...prev, bodyHtml: getDefaultTemplateBodyHtml(prev.type) }))
    setResetConfirmOpen(false)
    toast.success("Document reset to the default layout.")
  }

  function handleSave() {
    if (!draft.name.trim()) {
      toast.error("Please enter a template name.")
      return
    }
    const actor = session?.name ?? "Staff"
    const values = {
      name: draft.name,
      type: draft.type,
      status: draft.status,
      requireResidentPhoto: draft.requireResidentPhoto,
      showBarangayLogo: draft.showBarangayLogo,
      showBarangayDrySeal: draft.showBarangayDrySeal,
      bodyHtml: draft.bodyHtml,
    }

    if (selectedTemplateId) {
      updateTemplate(selectedTemplateId, values, actor)
      toast.success("Template updated successfully.")
    } else {
      const created = addTemplate(values, actor)
      setSelectedTemplateId(created.id)
      toast.success("Template saved successfully.")
    }
  }

  function handlePrint() {
    window.print()
  }

  async function handleExportPdf() {
    if (!printPaperRef.current) return
    setExporting(true)
    try {
      await exportElementAsPdf(printPaperRef.current, `${draft.name || "certificate-template"}.pdf`)
      toast.success("PDF exported successfully.")
    } catch {
      toast.error("Unable to export PDF. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border bg-[#F8FAFC]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/dashboard/certificates")} aria-label="Back">
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Certificate Template Builder</h1>
                <p className="text-sm text-muted-foreground">Create and manage reusable barangay certificate templates.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedTemplateId ?? ""} onValueChange={handleSelectTemplate}>
                <SelectTrigger className="h-10 w-56">
                  <SelectValue placeholder="Load a saved template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" className="h-10" onClick={handleNewTemplate}>
                <Plus className="size-4" />
                New Template
              </Button>
              <Button type="button" className="h-10" onClick={handleSave}>
                <Save className="size-4" />
                Save Template
              </Button>
              <Button type="button" variant="outline" className="h-10" onClick={handlePrint}>
                <Printer className="size-4" />
                Print Preview
              </Button>
              <Button type="button" variant="outline" className="h-10" onClick={handleExportPdf} disabled={exporting}>
                <Download className="size-4" />
                {exporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </div>

        <TemplateSettingsBar
          name={draft.name}
          onNameChange={(name) => setDraft((prev) => ({ ...prev, name }))}
          type={draft.type}
          onTypeChange={(type) => setDraft((prev) => ({ ...prev, type }))}
          status={draft.status}
          onStatusChange={(status) => setDraft((prev) => ({ ...prev, status }))}
          requireResidentPhoto={draft.requireResidentPhoto}
          onRequireResidentPhotoChange={(requireResidentPhoto) => setDraft((prev) => ({ ...prev, requireResidentPhoto }))}
          showBarangayLogo={draft.showBarangayLogo}
          onShowBarangayLogoChange={(showBarangayLogo) => setDraft((prev) => ({ ...prev, showBarangayLogo }))}
          showBarangayDrySeal={draft.showBarangayDrySeal}
          onShowBarangayDrySealChange={(showBarangayDrySeal) => setDraft((prev) => ({ ...prev, showBarangayDrySeal }))}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CertificateDocumentEditor html={draft.bodyHtml} onChange={(bodyHtml) => setDraft((prev) => ({ ...prev, bodyHtml }))} />
          </div>

          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-40 space-y-3">
              <p className="font-heading text-sm font-semibold text-foreground">Live Certificate Preview</p>
              <div className="overflow-x-auto rounded-xl border border-border bg-secondary/30 p-4">
                <CertificatePreviewPaper
                  bodyHtml={draft.bodyHtml}
                  type={draft.type}
                  requireResidentPhoto={draft.requireResidentPhoto}
                  showBarangayLogo={draft.showBarangayLogo}
                  showBarangayDrySeal={draft.showBarangayDrySeal}
                  className="shadow-lg"
                  ref={printPaperRef}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-white p-4 shadow-sm">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={() => setResetConfirmOpen(true)}>
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button type="button" variant="outline" onClick={handleExportPdf} disabled={exporting}>
            <Download className="size-4" />
            Export PDF
          </Button>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button type="button" onClick={handleSave}>
            <Save className="size-4" />
            Save Template
          </Button>
        </div>

        <Button
          type="button"
          size="lg"
          className="fixed bottom-5 right-5 z-30 h-12 rounded-full px-5 shadow-lg lg:hidden"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="size-4" />
          Preview
        </Button>
      </div>

      {/* Print-only copy: sized to fill the printed page while everything above is hidden via print:hidden. */}
      <div className="hidden print:block">
        <CertificatePreviewPaper
          bodyHtml={draft.bodyHtml}
          type={draft.type}
          requireResidentPhoto={draft.requireResidentPhoto}
          showBarangayLogo={draft.showBarangayLogo}
          showBarangayDrySeal={draft.showBarangayDrySeal}
        />
      </div>

      <CertificatePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        bodyHtml={draft.bodyHtml}
        type={draft.type}
        requireResidentPhoto={draft.requireResidentPhoto}
        showBarangayLogo={draft.showBarangayLogo}
        showBarangayDrySeal={draft.showBarangayDrySeal}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset Document"
        description="This will replace the current document with the default layout for this certificate type. Your custom edits will be lost."
        destructive
        confirmLabel="Reset"
        onConfirm={handleReset}
      />
    </div>
  )
}
