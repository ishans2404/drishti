import Link from "next/link"
import { ArrowRight, BellRing, Building2, Monitor, UploadCloud, PanelsTopLeft, MonitorPlay } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Monitor,
    title: "Centralized Display Management",
    description:
      "Manage all digital notice boards across departments and locations from a single administration dashboard."
  },
  {
    icon: BellRing,
    title: "Real-Time Announcements",
    description:
      "Push notices, alerts, and events instantly. Content updates propagate to all assigned displays within seconds."
  },
  {
    icon: UploadCloud,
    title: "Rich Media Support",
    description:
      "Upload images, videos, and audio. Assign media to specific displays or broadcast across all locations."
  },
  {
    icon: PanelsTopLeft,
    title: "Template-Based Layout Builder",
    description:
      "Choose from preset templates for lobbies, hospitals, schools, and offices. Drag zones to customize each display."
  },
  {
    icon: Building2,
    title: "Multi-Organization Support",
    description:
      "Manage multiple institutions from one account. Switch between organizations with a single click."
  },
  {
    icon: MonitorPlay,
    title: "Public Kiosk Links",
    description:
      "Each display gets a shareable URL. Visitors need no login — open on any screen, TV, or kiosk."
  }
]

const previewNotices = [
  "OPD timings updated: Monday–Saturday, 9:00 AM – 5:00 PM",
  "Blood donation camp — Hall A, 25 May 2026, 10:00 AM",
  "New safety SOP document published — refer noticeboard"
]

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "#f0f4f9", color: "#0d1b2e" }}>

      {/* Top accent stripe */}
      <div className="h-1.5 w-full"
        style={{ background: "linear-gradient(90deg, #1a3a6e 0%, #b8861a 100%)" }} />

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b sm:px-10"
        style={{ background: "#0f2347", borderColor: "#1e3a6e" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded font-bold text-sm"
            style={{ background: "#b8861a", color: "#fff" }}>
            DR
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wider">DRISHTI</div>
            <div className="text-[10px]" style={{ color: "#8aaad0" }}>
              Digital Notice Board System
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-white text-sm hover:bg-white/10 h-8 px-3">
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild className="h-8 px-4 text-sm font-semibold"
            style={{ background: "#b8861a", color: "#fff" }}>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f2347 0%, #1a3a6e 60%, #1e4a8a 100%)" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 sm:px-10 lg:flex lg:items-center lg:gap-12">

          {/* Text */}
          <div className="lg:flex-1">
            <div
              className="mb-4 inline-block rounded px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{ background: "rgba(184,134,26,0.25)", color: "#c8a84b" }}
            >
              Digital Signage Platform
            </div>
            <h1 className="text-3xl font-bold leading-snug text-white sm:text-4xl lg:text-5xl">
              Manage Digital Notice Boards
              <br />
              <span style={{ color: "#c8a84b" }}>Across Every Location</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7" style={{ color: "#8aaad0" }}>
              Drishti provides hospitals, schools, and government offices a unified
              web dashboard to publish announcements, media, documents, and events
              to digital screens — centrally controlled, instantly updated.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="h-9 px-5 text-sm font-semibold"
                style={{ background: "#b8861a", color: "#fff" }}>
                <Link href="/auth/sign-up">
                  Create Workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline"
                className="h-9 px-5 text-sm border-white/25 text-white hover:bg-white/10">
                <Link href="/auth/login">Administrator Login</Link>
              </Button>
            </div>
          </div>

          {/* Mock display */}
          <div className="mt-12 lg:mt-0 lg:flex-1">
            <div
              className="rounded-lg border overflow-hidden shadow-2xl"
              style={{ background: "#101820", borderColor: "rgba(255,255,255,0.12)" }}
            >
              {/* Display header */}
              <div className="flex items-center justify-between border-b px-4 py-3"
                style={{ background: "#132233", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded text-xs font-bold"
                    style={{ background: "#1a3a6e", color: "#fff" }}>
                    DH
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">District Hospital — Main Lobby</div>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Live display preview
                    </div>
                  </div>
                </div>
                <div className="text-right text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  LIVE
                </div>
              </div>
              {/* Content grid */}
              <div className="grid grid-cols-[1fr_200px] gap-3 p-3">
                {/* Hero zone */}
                <div className="rounded flex items-end p-4"
                  style={{ background: "linear-gradient(135deg,#1a3a6e,#0f9f9a)", minHeight: 140 }}>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)" }}>
                      Health Awareness
                    </div>
                    <div className="text-base font-bold text-white leading-snug mt-1">
                      Real-time updates<br />across every screen.
                    </div>
                  </div>
                </div>
                {/* Notice rail */}
                <div className="rounded p-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white">
                    <BellRing className="h-3.5 w-3.5" style={{ color: "#c8a84b" }} />
                    Notice Board
                  </div>
                  <div className="space-y-1.5">
                    {previewNotices.map((n) => (
                      <div key={n} className="rounded p-1.5 text-[10px] text-white leading-snug"
                        style={{ background: "rgba(255,255,255,0.08)" }}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Ticker */}
              <div className="overflow-hidden px-3 py-2 text-xs font-semibold"
                style={{ background: "#c8a84b", color: "#0d1b2e" }}>
                Emergency contacts updated &nbsp;•&nbsp; New event schedule published &nbsp;•&nbsp; Main lobby display active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by band */}
      <div className="border-y py-4 text-center text-xs font-semibold uppercase tracking-widest"
        style={{ borderColor: "#d0dae6", color: "#8a9ab0", background: "#fff" }}>
        Trusted by Hospitals · Schools · Government Departments · Public Institutions
      </div>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold" style={{ color: "#0d1b2e" }}>
            Platform Capabilities
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#5a6a7e" }}>
            Everything needed to deploy and manage digital notice boards at scale.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}
              className="rounded-lg border bg-white p-5 card-elevated"
              style={{ borderColor: "#d0dae6" }}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded"
                style={{ background: "#eef2f7" }}>
                <f.icon className="h-5 w-5" style={{ color: "#1a3a6e" }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: "#0d1b2e" }}>{f.title}</div>
              <p className="mt-1.5 text-xs leading-5" style={{ color: "#5a6a7e" }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-12 text-center" style={{ borderColor: "#d0dae6", background: "#fff" }}>
        <h2 className="text-xl font-bold" style={{ color: "#0d1b2e" }}>
          Ready to deploy digital notice boards?
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#5a6a7e" }}>
          Create your administrator workspace and first display in under two minutes.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="h-9 px-6 text-sm font-semibold"
            style={{ background: "#1a3a6e" }}>
            <Link href="/auth/sign-up">
              Create Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-4 sm:px-10"
        style={{ background: "#0f2347", borderColor: "#1e3a6e" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ color: "#6a8ab0" }}>
          <span>© 2026 Drishti — Digital Signage Management System</span>
          <span>Powered by Global Infotech, Durg</span>
        </div>
      </footer>
    </main>
  )
}