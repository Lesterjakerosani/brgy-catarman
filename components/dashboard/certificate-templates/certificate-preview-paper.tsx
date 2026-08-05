import * as React from "react"
import { buildSampleData, renderTemplateHtml } from "@/lib/certificate-placeholders"
import { cn } from "@/lib/utils"
import type { CertificateTemplateType } from "@/types"

interface CertificatePreviewPaperProps {
  bodyHtml: string
  type: CertificateTemplateType
  requireResidentPhoto: boolean
  showBarangayLogo: boolean
  showBarangayDrySeal: boolean
  className?: string
}

export const CertificatePreviewPaper = React.forwardRef<HTMLDivElement, CertificatePreviewPaperProps>(function CertificatePreviewPaper(
  { bodyHtml, type, requireResidentPhoto, showBarangayLogo, showBarangayDrySeal, className },
  ref
) {
  const rendered = React.useMemo(
    () =>
      renderTemplateHtml(bodyHtml, buildSampleData(type), {
        requireResidentPhoto,
        showBarangayLogo,
        showBarangayDrySeal,
      }),
    [bodyHtml, type, requireResidentPhoto, showBarangayLogo, showBarangayDrySeal]
  )

  return (
    <div
      ref={ref}
      id="certificate-preview-paper"
      className={cn("mx-auto min-h-[297mm] w-[210mm] max-w-none bg-white p-[18mm] text-[13px] leading-relaxed text-[#0F172A]", "cert-document", className)}
      style={{ fontFamily: "Georgia, serif" }}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
})
