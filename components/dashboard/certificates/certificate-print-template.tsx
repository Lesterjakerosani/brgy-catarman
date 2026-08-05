import { QRCodeSVG } from "qrcode.react"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { officials } from "@/data/officials"
import { systemSettings } from "@/data/settings"
import { getCertificateBody, getCertificateTitle } from "@/lib/certificate-templates"
import { formatDate } from "@/lib/format"
import type { CertificateRequest } from "@/types"

export function CertificatePrintTemplate({ request }: { request: CertificateRequest }) {
  const captain = officials.find((o) => o.position === "Punong Barangay")
  const secretary = officials.find((o) => o.position === "Barangay Secretary")

  return (
    <div className="mx-auto flex w-[8.5in] min-h-[13in] flex-col border border-border/50 bg-white p-14 text-[#0a1930] print:border-0 print:p-0">
      <div className="flex items-center justify-between border-b-4 border-double border-gold pb-4">
        <div className="flex items-center gap-4">
          <BarangaySeal className="size-20" />
          <div>
            <p className="text-xs">Republic of the Philippines</p>
            <p className="text-xs">Province of {systemSettings.province}</p>
            <p className="text-xs">{systemSettings.municipality}</p>
            <p className="font-heading text-lg font-bold">OFFICE OF THE {systemSettings.barangayName.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex size-24 items-center justify-center overflow-hidden rounded border border-border">
          <InitialsAvatar name={request.requestorName} photoUrl={request.residentPhotoUrl} size="xl" className="size-24 rounded-none" />
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm tracking-widest text-muted-foreground">OFFICE OF THE PUNONG BARANGAY</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase tracking-wide">{getCertificateTitle(request)}</h1>
      </div>

      <div className="mt-10 flex-1 text-justify text-[15px] leading-8">
        <p className="mb-6">TO WHOM IT MAY CONCERN:</p>
        <p className="indent-10">{getCertificateBody(request)}</p>
        <p className="mt-6 indent-10">
          Issued this {formatDate(request.approvedAt ?? request.submittedAt, "do")} day of {formatDate(request.approvedAt ?? request.submittedAt, "MMMM, yyyy")} at
          the Barangay Hall, {systemSettings.barangayName}, {systemSettings.municipality}, {systemSettings.province}.
        </p>
      </div>

      <div className="mt-16 flex items-end justify-between">
        <div className="text-center">
          <div className="rounded border border-border p-2">
            <QRCodeSVG value={`${request.referenceNumber}|${request.controlNumber ?? ""}`} size={84} />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Control No. {request.controlNumber ?? "—"}</p>
          <p className="text-[10px] text-muted-foreground">Ref. {request.referenceNumber}</p>
        </div>

        <div className="text-center">
          <p className="font-heading text-lg font-bold">{captain?.name}</p>
          <div className="mt-1 w-64 border-t border-foreground pt-1 text-xs">{captain?.position}</div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground">
        <span>Certified by: {secretary?.name} · {secretary?.position}</span>
        <span>Not valid without official barangay seal</span>
      </div>
    </div>
  )
}
