"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { GalleryItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Image, Trash2, Video } from "lucide-react"

export default function GalleryPage() {
  const { currentOrg } = useOrg()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    loadItems()
  }, [currentOrg])

  async function loadItems() {
    if (!currentOrg) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("display_order", { ascending: true })
    
    setItems(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setTitle("")
    setMediaUrl("")
    setMediaType("image")
    setIsActive(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!currentOrg || !mediaUrl.trim()) {
      setFormError("Media URL is required")
      return
    }

    setIsSaving(true)
    setFormError(null)
    const supabase = createClient()

    const { error } = await supabase.from("gallery").insert({
      organization_id: currentOrg.id,
      title: title.trim() || null,
      media_url: mediaUrl.trim(),
      media_type: mediaType,
      is_active: isActive,
      display_order: items.length,
    })

    if (error) {
      setFormError(error.message)
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadItems()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return
    
    const supabase = createClient()
    await supabase.from("gallery").delete().eq("id", id)
    loadItems()
  }

  async function handleToggleActive(item: GalleryItem) {
    const supabase = createClient()
    await supabase
      .from("gallery")
      .update({ is_active: !item.is_active })
      .eq("id", item.id)
    loadItems()
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Gallery" 
        description="Manage images and videos"
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Media
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <Card className="py-12 text-center">
            <Image className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No gallery items yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add images or videos to display on your boards.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Media
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {item.media_type === "video" ? (
                    <div className="flex h-full items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.media_url}
                      alt={item.title || "Gallery image"}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {!item.is_active && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <span className="text-sm text-muted-foreground">Inactive</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">
                      {item.title || "Untitled"}
                    </p>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={() => handleToggleActive(item)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Media</DialogTitle>
            <DialogDescription>
              Add an image or video to your gallery.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="Campus photo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="mediaType">Media Type</Label>
              <Select value={mediaType} onValueChange={(v) => setMediaType(v as "image" | "video")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="mediaUrl">Media URL</Label>
              <Input
                id="mediaUrl"
                placeholder={mediaType === "video" ? "https://youtube.com/watch?v=..." : "https://example.com/image.jpg"}
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Adding..." : "Add Media"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
