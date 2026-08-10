import { Navbar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"
import { PublicActionDialogs } from "@/components/public/public-action-dialogs"
import { AiAssistantWidget } from "@/components/public/ai-assistant-widget"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[6.25rem]">{children}</main>
      <Footer />
      <PublicActionDialogs />
      <AiAssistantWidget />
    </>
  )
}
