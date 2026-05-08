import { FileText, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { StatusMessage } from "@/components/admin/status-message"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import { createContentAction, deleteContentAction, linkContentAction, toggleContentAction } from "@/lib/actions/content"
import { getAdminContext } from "@/lib/server-data"
import { createClient } from "@/lib/supabase/server"
import type { ContentItem, ContentType, Display } from "@/lib/types"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const contentTypes: Array<{ value: ContentType; label: string }> = [
  { value: "notice", label: "Announcement / Notice" },
  { value: "event", label: "News / Event" },
  { value: "document", label: "Document" },
  { value: "link", label: "Link" },
  { value: "alert", label: "Emergency Alert" },
  { value: "ticker", label: "Footer Ticker" }
]

export default async function ContentPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const context = await getAdminContext()
  const supabase = await createClient()

  if (!context.currentOrg) {
    return <PageHeader title="Content Library" description="Create an organization first." />
  }

  const [{ data: contentItems }, { data: displays }, { data: links }] = await Promise.all([
    supabase
      .from("content_items")
      .select("*")
      .eq("organization_id", context.currentOrg.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("displays").select("*").eq("organization_id", context.currentOrg.id).order("name"),
    supabase.from("display_content").select("*")
  ])

  const items = (contentItems || []) as ContentItem[]
  const displayList = (displays || []) as Display[]
  const linkMap = new Map<string, Set<string>>()
  ;(links || []).forEach((link) => {
    const current = linkMap.get(link.content_item_id) || new Set<string>()
    current.add(link.display_id)
    linkMap.set(link.content_item_id, current)
  })

  return (
    <>
      <PageHeader
        title="Content Library"
        description="Reusable notices, news, documents, links, alerts, and tickers that can be assigned to any display."
      />
      <StatusMessage searchParams={params} />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[390px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createContentAction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="type">Type</label>
                <NativeSelect id="type" name="type" defaultValue="notice">
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">Title</label>
                <Input id="title" name="title" placeholder="Holiday notice" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="body">Body</label>
                <Textarea id="body" name="body" placeholder="Short message shown on the board" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="starts_at">Starts</label>
                  <Input id="starts_at" name="starts_at" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="ends_at">Ends</label>
                  <Input id="ends_at" name="ends_at" type="datetime-local" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="url">URL</label>
                  <Input id="url" name="url" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="display_order">Order</label>
                  <Input id="display_order" name="display_order" type="number" defaultValue="0" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Assign to displays</div>
                <div className="space-y-2 rounded-md border border-border p-3">
                  {displayList.length ? displayList.map((display) => (
                    <label key={display.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="display_ids" value={display.id} className="h-4 w-4" />
                      {display.name}
                    </label>
                  )) : <div className="text-xs text-muted-foreground">Create a display first.</div>}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4" />
                Active
              </label>
              <Button className="w-full" type="submit">
                <FileText className="h-4 w-4" />
                Add content
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {items.length ? items.map((item) => {
            const linkedDisplays = linkMap.get(item.id) || new Set<string>()
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="capitalize">{item.type}</Badge>
                        <Badge variant={item.is_active ? "success" : "secondary"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.starts_at)} - {formatDate(item.ends_at)}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      {item.body ? <p className="mt-1 text-sm text-muted-foreground">{item.body}</p> : null}
                    </div>
                    <form action={linkContentAction} className="rounded-md bg-muted p-3">
                      <input type="hidden" name="content_item_id" value={item.id} />
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Visible on</div>
                      <div className="space-y-2">
                        {displayList.map((display) => (
                          <label key={display.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              name="display_ids"
                              value={display.id}
                              defaultChecked={linkedDisplays.has(display.id)}
                              className="h-4 w-4"
                            />
                            {display.name}
                          </label>
                        ))}
                      </div>
                      <Button className="mt-3 w-full" size="sm" variant="outline" type="submit">Update links</Button>
                    </form>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-border pt-4">
                    <form action={toggleContentAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="is_active" value={String(item.is_active)} />
                      <Button variant="outline" size="sm" type="submit">
                        {item.is_active ? "Disable" : "Enable"}
                      </Button>
                    </form>
                    <form action={deleteContentAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button variant="destructive" size="sm" type="submit">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            )
          }) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No content yet. Add a notice, ticker, alert, event, document, or link.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
