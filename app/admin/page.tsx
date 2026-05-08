import Link from "next/link"
import { ArrowRight, FileText, Images, Monitor, Palette } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAdminContext } from "@/lib/server-data"
import { createClient } from "@/lib/supabase/server"
import type { ContentItem, Display, MediaAsset } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const context = await getAdminContext()
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

  const displayList = (displays || []) as Display[]
  const contentList = (contentItems || []) as ContentItem[]
  const mediaList = (mediaAssets || []) as MediaAsset[]
  const activeDisplays = displayList.filter((display) => display.is_active).length

  const metrics = [
    { label: "Displays", value: displayList.length, detail: `${activeDisplays} active`, icon: Monitor },
    { label: "Content Items", value: contentList.length, detail: "notices, events, alerts", icon: FileText },
    { label: "Media Assets", value: mediaList.length, detail: "images, video, audio", icon: Images },
    { label: "Templates", value: 5, detail: "hybrid layouts", icon: Palette }
  ]

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Workspace: ${context.currentOrg.name}. Publish content once and place it across multiple displays.`}
        actions={
          <Button asChild>
            <Link href="/admin/displays">
              New display
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <metric.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Displays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayList.length ? displayList.slice(0, 5).map((display) => (
                <div key={display.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <div className="font-medium">{display.name}</div>
                    <div className="text-xs text-muted-foreground">/display/{display.slug}</div>
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
                <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No displays yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contentList.length ? contentList.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-md bg-muted p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="text-xs capitalize text-muted-foreground">{item.type}</div>
                  </div>
                  <Badge variant={item.is_active ? "success" : "secondary"}>
                    {item.is_active ? "Live" : "Off"}
                  </Badge>
                </div>
              )) : (
                <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Create notices, events, links, tickers, and alerts.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
