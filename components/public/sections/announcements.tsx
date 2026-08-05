import Link from "next/link"
import { ArrowRight, Megaphone, Pin } from "lucide-react"
import { announcements } from "@/data/announcements"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"

export function AnnouncementsSection() {
  const topAnnouncements = [...announcements]
    .filter((a) => a.status === "Published")
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime())
    .slice(0, 3)

  return (
    <section id="announcements" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2">
            <Megaphone className="size-5 text-primary" />
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Latest Announcements</p>
          </div>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">Community Bulletin</h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {topAnnouncements.map((a) => (
            <Card key={a.id} className="h-full border-border/70 transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {a.isPinned ? (
                    <Badge className="gap-1 bg-gold text-gold-foreground hover:bg-gold">
                      <Pin className="size-3" />
                      Pinned
                    </Badge>
                  ) : null}
                  <Badge variant="outline">{a.category}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(a.publishAt)}</span>
                </div>
                <h3 className="mt-3 font-heading text-lg font-bold text-foreground">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/announcements">
              View More
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
