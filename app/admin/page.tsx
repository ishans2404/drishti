import Link from "next/link"
import { ArrowRight, FileText, Images, Monitor, Palette } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAdminContext } from "@/lib/server-data"
import { createClient } from "@/lib/supabase/server"
import type { ContentItem, Display, MediaAsset } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const context  = await getAdminContext()
  const supabase = await createClient()

  if (!context.currentOrg) {
    return (
      <>
        <PageHeader title="Overview" description="Create an organization workspace to begin." />
        <div className="p-6">
          <Button asChild>
            <Link href="/admin/organization">Create organization</Link>
          </Button>
        </div>
      </>
    )
  }

  const [{ data: displays }, { data: contentItems }, { data: mediaAssets }] = await Promise.all([
    supabase.from("displays").select("*").eq("organization_id", context.currentOrg.id),
    supabase.from("content_items").select("*").eq("organization_id", context.currentOrg.id).order("created_at", { ascending: false }),
    supabase.from("media_assets").select("*").eq("organization_id", context.currentOrg.id).order("created_at", { ascending: false })
  ])

  const displayList  = (displays    || []) as Display[]
  const contentList  = (contentItems || []) as ContentItem[]
  const mediaList    = (mediaAssets  || []) as MediaAsset[]
  const activeDisplays = displayList.filter((d) => d.is_active).length

  const metrics = [
    { label: "Total Displays",   value: displayList.length,  sub: `${activeDisplays} active`,            icon: Monitor,  color: "#1a3a6e" },
    { label: "Content Items",    value: contentList.length,  sub: "notices, events, alerts, tickers",     icon: FileText, color: "#0f6e5e" },
    { label: "Media Assets",     value: mediaList.length,    sub: "images, video, audio",                 icon: Images,   color: "#7a3a00" },
    { label: "Templates",        value: 5,                   sub: "lobby, hospital, school, office…",     icon: Palette,  color: "#3a1a6e" }
  ]

  return (
    <>
      <PageHeader
        title="Dashboard Overview"
        description={`Organization: ${context.currentOrg.name}`}
        actions={
          <Button asChild size="sm" style={{ background: "#1a3a6e" }}>
            <Link href="/admin/displays">
              New Display <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">

        {/* Metric cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label}
              className="rounded-lg border bg-white p-4 card-elevated"
              style={{ borderColor: "#d0dae6" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5a6a7e" }}>
                    {m.label}
                  </div>
                  <div className="mt-1 text-3xl font-bold" style={{ color: "#0d1b2e" }}>
                    {m.value}
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: "#8a9ab0" }}>{m.sub}</div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded"
                  style={{ background: m.color + "18" }}>
                  <m.icon className="h-5 w-5" style={{ color: m.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main panels */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

          {/* Displays list */}
          <div className="rounded-lg border bg-white card-elevated" style={{ borderColor: "#d0dae6" }}>
            <div className="flex items-center justify-between border-b px-5 py-3"
              style={{ borderColor: "#eaeff5" }}>
              <h2 className="text-sm font-semibold" style={{ color: "#0d1b2e" }}>Displays</h2>
              <Link href="/admin/displays"
                className="text-xs font-medium hover:underline" style={{ color: "#1a3a6e" }}>
                Manage all
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: "#eaeff5" }}>
              {displayList.length ? displayList.slice(0, 6).map((display) => (
                <div key={display.id}
                  className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#0d1b2e" }}>
                      {display.name}
                    </div>
                    <div className="text-xs" style={{ color: "#8a9ab0" }}>
                      /display/{display.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={display.is_active ? "success" : "secondary"}>
                      {display.is_active ? "Active" : "Paused"}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/displays/${display.id}/builder`}>Builder</Link>
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm" style={{ color: "#8a9ab0" }}>
                  No displays yet.{" "}
                  <Link href="/admin/displays" className="font-medium hover:underline" style={{ color: "#1a3a6e" }}>
                    Create your first display.
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent content */}
          <div className="rounded-lg border bg-white card-elevated" style={{ borderColor: "#d0dae6" }}>
            <div className="flex items-center justify-between border-b px-5 py-3"
              style={{ borderColor: "#eaeff5" }}>
              <h2 className="text-sm font-semibold" style={{ color: "#0d1b2e" }}>Recent Content</h2>
              <Link href="/admin/content"
                className="text-xs font-medium hover:underline" style={{ color: "#1a3a6e" }}>
                View all
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: "#eaeff5" }}>
              {contentList.length ? contentList.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium" style={{ color: "#0d1b2e" }}>
                      {item.title}
                    </div>
                    <div className="text-xs capitalize" style={{ color: "#8a9ab0" }}>{item.type}</div>
                  </div>
                  <Badge variant={item.is_active ? "success" : "secondary"} className="ml-3 shrink-0">
                    {item.is_active ? "Live" : "Off"}
                  </Badge>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm" style={{ color: "#8a9ab0" }}>
                  No content yet.{" "}
                  <Link href="/admin/content" className="font-medium hover:underline" style={{ color: "#1a3a6e" }}>
                    Add notices, events, or alerts.
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick-start steps if empty */}
        {displayList.length === 0 && (
          <div className="rounded-lg border bg-white p-6 card-elevated" style={{ borderColor: "#d0dae6" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#0d1b2e" }}>
              Quick Setup Guide
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { step: "01", title: "Create a Display", desc: "Add your first digital notice board and choose a template.", href: "/admin/displays" },
                { step: "02", title: "Add Content",      desc: "Publish notices, events, alerts, and tickers.",            href: "/admin/content" },
                { step: "03", title: "Share the Link",   desc: "Copy the public URL and open it on any screen or TV.",     href: "/admin/displays" }
              ].map((s) => (
                <Link key={s.step} href={s.href}
                  className="rounded-lg border p-4 hover:shadow-md transition-shadow group"
                  style={{ borderColor: "#d0dae6" }}>
                  <div className="text-2xl font-bold mb-2" style={{ color: "#d0dae6" }}>{s.step}</div>
                  <div className="text-sm font-semibold group-hover:text-[#1a3a6e]" style={{ color: "#0d1b2e" }}>
                    {s.title}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#8a9ab0" }}>{s.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}