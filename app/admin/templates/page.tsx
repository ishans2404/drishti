import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DisplayCanvas } from "@/components/display/display-canvas"
import { createDefaultLayout, defaultTheme, getTemplateKeys, templateDescriptions, templateNames } from "@/lib/templates"
import type { DisplayPayload, TemplateKey } from "@/lib/types"

function previewPayload(template: TemplateKey): DisplayPayload {
  return {
    organization: {
      id: "preview",
      name: "Drishti Preview",
      slug: "preview",
      logo_url: null,
      primary_color: defaultTheme.primaryColor,
      created_at: new Date().toISOString()
    },
    display: {
      id: "preview",
      organization_id: "preview",
      name: templateNames[template],
      slug: "preview",
      template_key: template,
      layout_config: createDefaultLayout(template),
      theme_config: defaultTheme,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    contentItems: [
      {
        id: "notice",
        organization_id: "preview",
        type: "notice",
        title: "Vaccination camp notice",
        body: "Hall A, 10 AM onwards",
        metadata: {},
        starts_at: null,
        ends_at: null,
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: "event",
        organization_id: "preview",
        type: "event",
        title: "Monthly review",
        body: "Conference room",
        metadata: {},
        starts_at: new Date().toISOString(),
        ends_at: null,
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: "ticker",
        organization_id: "preview",
        type: "ticker",
        title: "All displays are connected",
        body: "Update once and publish everywhere",
        metadata: {},
        starts_at: null,
        ends_at: null,
        is_active: true,
        display_order: 3,
        created_at: new Date().toISOString()
      }
    ],
    mediaAssets: []
  }
}

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Templates"
        description="Hybrid presets define the first structure; the builder lets you resize, reorder, and style each zone."
        actions={
          <Button asChild>
            <Link href="/admin/displays">
              Create display
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-2">
        {getTemplateKeys().map((template) => (
          <Card key={template}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{templateNames[template]}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">{templateDescriptions[template]}</p>
                </div>
                <Badge variant="outline">{createDefaultLayout(template).zones.length} zones</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DisplayCanvas payload={previewPayload(template)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
