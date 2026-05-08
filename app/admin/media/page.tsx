import { FileAudio, FileText, ImageIcon, Trash2, UploadCloud, Video } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { StatusMessage } from "@/components/admin/status-message"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import { deleteMediaAction, linkMediaAction, uploadMediaAction } from "@/lib/actions/media"
import { getAdminContext } from "@/lib/server-data"
import { createClient } from "@/lib/supabase/server"
import type { Display, MediaAsset, MediaKind } from "@/lib/types"

export const dynamic = "force-dynamic"

const mediaKinds: Array<{ value: MediaKind; label: string }> = [
  { value: "image", label: "Image" },
  { value: "background", label: "Background" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "document", label: "Document" }
]

function MediaIcon({ kind }: { kind: MediaKind }) {
  if (kind === "video") return <Video className="h-4 w-4" />
  if (kind === "audio") return <FileAudio className="h-4 w-4" />
  if (kind === "document") return <FileText className="h-4 w-4" />
  return <ImageIcon className="h-4 w-4" />
}

export default async function MediaPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const context = await getAdminContext()
  const supabase = await createClient()

  if (!context.currentOrg) {
    return <PageHeader title="Media Library" description="Create an organization first." />
  }

  const [{ data: mediaAssets }, { data: displays }, { data: links }] = await Promise.all([
    supabase.from("media_assets").select("*").eq("organization_id", context.currentOrg.id).order("created_at", { ascending: false }),
    supabase.from("displays").select("*").eq("organization_id", context.currentOrg.id).order("name"),
    supabase.from("display_media").select("*")
  ])

  const mediaList = (mediaAssets || []) as MediaAsset[]
  const displayList = (displays || []) as Display[]
  const linkMap = new Map<string, Set<string>>()
  ;(links || []).forEach((link) => {
    const current = linkMap.get(link.media_asset_id) || new Set<string>()
    current.add(link.display_id)
    linkMap.set(link.media_asset_id, current)
  })

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Upload images, background visuals, video, audio, and documents, then assign them to displays."
      />
      <StatusMessage searchParams={params} />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[390px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={uploadMediaAction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">Title</label>
                <Input id="title" name="title" placeholder="Awareness banner" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="kind">Kind</label>
                <NativeSelect id="kind" name="kind" defaultValue="image">
                  {mediaKinds.map((kind) => (
                    <option key={kind.value} value={kind.value}>{kind.label}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="file">File</label>
                <Input id="file" name="file" type="file" required />
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
              <Button className="w-full" type="submit">
                <UploadCloud className="h-4 w-4" />
                Upload asset
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {mediaList.length ? mediaList.map((asset) => {
            const linkedDisplays = linkMap.get(asset.id) || new Set<string>()
            return (
              <Card key={asset.id} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  {asset.kind === "image" || asset.kind === "background" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.public_url} alt={asset.title} className="h-full w-full object-cover" />
                  ) : asset.kind === "video" ? (
                    <video src={asset.public_url} className="h-full w-full object-cover" muted controls />
                  ) : asset.kind === "audio" ? (
                    <div className="flex h-full items-center justify-center p-4">
                      <audio src={asset.public_url} controls className="w-full" />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <FileText className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-4 p-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        <MediaIcon kind={asset.kind} />
                        {asset.kind}
                      </Badge>
                    </div>
                    <h2 className="truncate font-semibold">{asset.title}</h2>
                    <p className="text-xs text-muted-foreground">{asset.mime_type || "file"} · {Math.round((asset.size_bytes || 0) / 1024)} KB</p>
                  </div>
                  <form action={linkMediaAction} className="rounded-md bg-muted p-3">
                    <input type="hidden" name="media_asset_id" value={asset.id} />
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
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="id" value={asset.id} />
                    <input type="hidden" name="storage_path" value={asset.storage_path} />
                    <Button variant="destructive" size="sm" type="submit">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
          }) : (
            <Card className="md:col-span-2 2xl:col-span-3">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No media yet. Upload visual backgrounds, videos, audio, or PDFs.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
