"use client"

import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CertificatePreviewPaper } from "@/components/dashboard/certificate-templates/certificate-preview-paper"
import type { CertificateTemplateType } from "@/types"

interface CertificatePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bodyHtml: string
  type: CertificateTemplateType
  requireResidentPhoto: boolean
  showBarangayLogo: boolean
  showBarangayDrySeal: boolean
}

export function CertificatePreviewDialog({
  open,
  onOpenChange,
  bodyHtml,
  type,
  requireResidentPhoto,
  showBarangayLogo,
  showBarangayDrySeal,
}: CertificatePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-screen w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:h-screen sm:max-w-none"
      >
        <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
          <DialogTitle>Live Certificate Preview</DialogTitle>
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close preview">
            <X className="size-5" />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-secondary/30 p-4">
          <CertificatePreviewPaper
            bodyHtml={bodyHtml}
            type={type}
            requireResidentPhoto={requireResidentPhoto}
            showBarangayLogo={showBarangayLogo}
            showBarangayDrySeal={showBarangayDrySeal}
            className="shadow-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
