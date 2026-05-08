import Link from "next/link"
import { ArrowRight, BellRing, Building2, Clock3, MonitorPlay, PanelsTopLeft, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const previewNotices = [
  "Blood donation camp at 11:00 AM",
  "New safety SOP document published",
  "OPD queue updates now visible on lobby screen"
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#172033]">
      <section className="relative min-h-[92vh] overflow-hidden bg-[#101418] text-white">
        <div className="absolute inset-x-0 top-20 mx-auto h-[68vh] w-[94vw] max-w-7xl overflow-hidden rounded-lg border border-white/12 bg-[#0b1118] shadow-2xl md:right-[-10vw] md:left-auto md:w-[72vw]">
          <div className="absolute inset-0 grid grid-cols-[1.2fr_0.8fr] gap-3 p-4 opacity-80">
            <div className="flex flex-col overflow-hidden rounded-md bg-[#132233]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2457d6] text-xs font-bold">DR</div>
                  <div>
                    <div className="text-sm font-semibold">City Hospital Lobby</div>
                    <div className="text-xs text-white/45">Live display preview</div>
                  </div>
                </div>
                <div className="text-right text-xs text-white/50">
                  <Clock3 className="mb-1 ml-auto h-4 w-4" />
                  10:24 AM
                </div>
              </div>
              <div className="grid flex-1 grid-rows-[1fr_auto]">
                <div className="m-4 flex items-end rounded-md bg-[#1d6f69] p-5">
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-wider text-white/60">Awareness screen</div>
                    <div className="max-w-sm text-3xl font-semibold leading-tight">Real-time updates across every screen.</div>
                  </div>
                </div>
                <div className="mx-4 mb-4 overflow-hidden rounded-md bg-[#f6b73c] px-3 py-2 text-sm font-medium text-[#172033]">
                  <div className="kiosk-ticker whitespace-nowrap">Emergency contacts updated • New event schedule published • Main lobby display active</div>
                </div>
              </div>
            </div>
            <div className="hidden flex-col gap-3 overflow-hidden md:flex">
              <div className="rounded-md bg-white p-3 text-[#172033]">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <BellRing className="h-4 w-4 text-[#2457d6]" />
                  Notice Board
                </div>
                <div className="space-y-2">
                  {previewNotices.map((notice) => (
                    <div key={notice} className="rounded-md bg-[#f1f5fa] p-2 text-xs">
                      {notice}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Media", detail: "Images, video, audio", icon: UploadCloud, color: "text-[#f6b73c]" },
                  { label: "Builder", detail: "Resize zones", icon: PanelsTopLeft, color: "text-[#27c5b8]" },
                  { label: "Orgs", detail: "Switch locations", icon: Building2, color: "text-[#9bb6ff]" },
                  { label: "Public link", detail: "No login needed", icon: MonitorPlay, color: "text-[#f6b73c]" }
                ].map((item) => (
                  <div key={item.label} className="rounded-md bg-white/10 p-3">
                    <item.icon className={`mb-3 h-5 w-5 ${item.color}`} />
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-white/50">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-[#101418]/35" />

        <div className="relative z-10 flex min-h-[92vh] flex-col">
          <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-sm font-bold text-[#2457d6]">
                DR
              </div>
              <div>
                <div className="font-semibold">Drishti</div>
                <div className="text-xs text-white/60">Digital notice boards</div>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="bg-white text-[#172033] hover:bg-white/90">
                <Link href="/auth/sign-up">Start</Link>
              </Button>
            </div>
          </header>

          <div className="flex flex-1 items-end px-5 pb-14 sm:px-8 lg:px-12">
            <div className="max-w-2xl">
              <Badge className="mb-5 bg-white/10 text-white ring-1 ring-white/15">Modern display board platform</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                Digital notice boards for every location.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
                Drishti gives hospitals, schools, and offices one web dashboard for announcements,
                media, documents, templates, and public kiosk links.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-[#f6b73c] text-[#172033] hover:bg-[#f4aa18]">
                  <Link href="/auth/sign-up">
                    Create workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10">
                  <Link href="/auth/login">Open admin</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
        {["Centralized control", "Realtime updates", "Template builder", "Public kiosk links"].map((item) => (
          <div key={item} className="rounded-lg border border-border bg-white p-4">
            <div className="text-sm font-semibold">{item}</div>
          </div>
        ))}
      </section>
    </main>
  )
}
