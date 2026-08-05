import { BarangaySeal } from "@/components/shared/barangay-seal"
import { officials } from "@/data/officials"
import { systemSettings } from "@/data/settings"
import { formatDate } from "@/lib/format"
import type { Blotter } from "@/types"

export function BlotterPrintTemplate({ blotter }: { blotter: Blotter }) {
  const captain = officials.find((o) => o.position === "Punong Barangay")
  const lupon = blotter.mediator ?? captain?.name

  return (
    <div className="mx-auto flex w-[8.5in] min-h-[13in] flex-col border border-border/50 bg-white p-14 text-[#0a1930] print:border-0 print:p-0">
      <div className="flex items-center justify-between border-b-4 border-double border-gold pb-4">
        <div className="flex items-center gap-4">
          <BarangaySeal className="size-20" />
          <div>
            <p className="text-xs">Republic of the Philippines</p>
            <p className="text-xs">Province of {systemSettings.province}</p>
            <p className="text-xs">{systemSettings.municipality}</p>
            <p className="font-heading text-lg font-bold">OFFICE OF THE LUPONG TAGAPAMAYAPA</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">Case No.</p>
          <p className="font-heading text-lg font-bold text-primary">{blotter.caseNumber}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide">Katarungang Pambarangay Blotter Report</h1>
        <p className="mt-1 text-sm text-muted-foreground">{blotter.incidentType}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Complainant</p>
          <p className="mt-1 font-semibold">{blotter.complainantName}</p>
          <p>{blotter.complainantAddress}</p>
          <p>{blotter.complainantContact}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Respondent</p>
          <p className="mt-1 font-semibold">{blotter.respondentName}</p>
          <p>{blotter.respondentAddress}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date of Incident</p>
          <p className="mt-1">{formatDate(blotter.incidentDate)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
          <p className="mt-1">{blotter.location}</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Narrative of Complaint</p>
        <p className="mt-2 text-justify text-sm leading-7">{blotter.narrative}</p>
      </div>

      {blotter.hearings.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hearing Schedule</p>
          <ul className="mt-2 space-y-1 text-sm">
            {blotter.hearings.map((h) => (
              <li key={h.id}>
                {formatDate(h.date)} — {h.status}
                {h.notes ? `: ${h.notes}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {blotter.resolution ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resolution</p>
          <p className="mt-2 text-justify text-sm leading-7">{blotter.resolution}</p>
        </div>
      ) : null}

      <div className="mt-auto flex items-end justify-between pt-16">
        <div className="text-center">
          <div className="w-56 border-t border-foreground pt-1 text-xs">Complainant&apos;s Signature</div>
        </div>
        <div className="text-center">
          <div className="w-56 border-t border-foreground pt-1 text-xs">Respondent&apos;s Signature</div>
        </div>
      </div>

      <div className="mt-12 flex items-end justify-center">
        <div className="text-center">
          <p className="font-heading text-base font-bold">{lupon}</p>
          <div className="mt-1 w-64 border-t border-foreground pt-1 text-xs">Lupon Tagapamayapa / Mediator</div>
        </div>
      </div>
    </div>
  )
}
