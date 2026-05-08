import Link from "next/link"
import { ExternalLink, Monitor, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { StatusMessage } from "@/components/admin/status-message"
import { CopyPublicLink } from "@/components/admin/copy-public-link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import { createDisplayAction, deleteDisplayAction, toggleDisplayAction, updateDisplayBasicsAction } from "@/lib/actions/displays"
import { getDisplaysForCurrentOrg } from "@/lib/server-data"
import { getTemplateKeys, templateNames } from "@/lib/templates"

export const dynamic = "force-dynamic"

export default async function DisplaysPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const { context, displays } = await getDisplaysForCurrentOrg()
  const templates = getTemplateKeys()

  return (
    <>
      <PageHeader
        title="Displays"
        description="Create shareable kiosk links, choose templates, and open the visual builder for each screen."
      />
      <StatusMessage searchParams={params} />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Display</CardTitle>
          </CardHeader>
          <CardContent>
            {context.currentOrg ? (
              <form action={createDisplayAction} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">Display name</label>
                  <Input id="name" name="name" placeholder="Main Lobby Display" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="slug">Public slug</label>
                  <Input id="slug" name="slug" placeholder="main-lobby-display" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="template_key">Template</label>
                  <NativeSelect id="template_key" name="template_key" defaultValue="lobby">
                    {templates.map((template) => (
                      <option key={template} value={template}>{templateNames[template]}</option>
                    ))}
                  </NativeSelect>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4" />
                  Active public link
                </label>
                <Button className="w-full" type="submit">
                  <Monitor className="h-4 w-4" />
                  Create and open builder
                </Button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground">Create an organization first.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {displays.length ? displays.map((display) => (
            <Card key={display.id}>
              <CardContent className="p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold">{display.name}</h2>
                          <Badge variant={display.is_active ? "success" : "secondary"}>
                            {display.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/display/{display.slug}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm">
                          <Link href={`/admin/displays/${display.id}/builder`}>
                            <Pencil className="h-4 w-4" />
                            Builder
                          </Link>
                        </Button>
                        <CopyPublicLink slug={display.slug} />
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/display/${display.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded bg-muted px-2 py-1">Template: {templateNames[display.template_key]}</span>
                      <span className="rounded bg-muted px-2 py-1">{display.layout_config.zones.length} zones</span>
                      <span className="rounded bg-muted px-2 py-1">Updated {new Date(display.updated_at).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <form action={updateDisplayBasicsAction} className="grid gap-2 rounded-md bg-muted p-3">
                    <input type="hidden" name="id" value={display.id} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input name="name" defaultValue={display.name} aria-label="Display name" />
                      <Input name="slug" defaultValue={display.slug} aria-label="Slug" />
                    </div>
                    <NativeSelect name="template_key" defaultValue={display.template_key}>
                      {templates.map((template) => (
                        <option key={template} value={template}>{templateNames[template]}</option>
                      ))}
                    </NativeSelect>
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input name="is_active" type="checkbox" defaultChecked={display.is_active} className="h-4 w-4" />
                        Active
                      </label>
                      <Button size="sm" type="submit">Save basics</Button>
                    </div>
                  </form>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  <form action={toggleDisplayAction}>
                    <input type="hidden" name="id" value={display.id} />
                    <input type="hidden" name="is_active" value={String(display.is_active)} />
                    <Button variant="outline" size="sm" type="submit">
                      {display.is_active ? "Pause" : "Activate"}
                    </Button>
                  </form>
                  <form action={deleteDisplayAction}>
                    <input type="hidden" name="id" value={display.id} />
                    <Button variant="destructive" size="sm" type="submit">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="flex min-h-64 items-center justify-center p-8 text-center">
                <div>
                  <Monitor className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">No displays yet</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Create your first display to get a public kiosk link and visual builder.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
