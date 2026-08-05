import { Megaphone, Phone } from "lucide-react"
import { announcements } from "@/data/announcements"
import { systemSettings } from "@/data/settings"

export function AnnouncementTicker() {
  const latest = announcements
    .filter((a) => a.status === "Published")
    .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime())
    .slice(0, 4)
    .map((a) => a.title)

  const feed = latest.length > 0 ? latest : ["Welcome to the e-Catarman online service portal."]

  return (
    <div className="flex h-9 items-center justify-between gap-4 bg-[#050f24] px-4 text-white sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold">
          <Megaphone className="size-3.5" />
          Latest
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs text-white/75">
            {[...feed, ...feed].map((title, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="size-1 shrink-0 rounded-full bg-gold/60" />
                {title}
              </span>
            ))}
          </div>
        </div>
      </div>
      <a
        href={`tel:${systemSettings.contactNumbers[0].replace(/[^0-9+]/g, "")}`}
        className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white sm:flex"
      >
        <Phone className="size-3.5" />
        {systemSettings.contactNumbers[0]}
      </a>
    </div>
  )
}
