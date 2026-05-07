"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { CustomContent } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Code, Pencil, Trash2 } from "lucide-react"

export default function CustomContentPage() {
  const { currentOrg } = useOrg()
  const [items, setItems] = useState<CustomContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CustomContent | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
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
      .from("custom_content")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("created_at", { ascending: false })
    
    setItems(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setEditingItem(null)
    setTitle("")
    setHtmlContent("")
    setIsActive(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(item: CustomContent) {
    setEditingItem(item)
    setTitle(item.title)
    setHtmlContent(item.html_content || "")
    setIsActive(item.is_active)
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!currentOrg || !title.trim()) {
      setFormError("Title is required")
      return
    }

    setIsSaving(true)
    setFormError(null)
    const supabase = createClient()

    const itemData = {
      organization_id: currentOrg.id,
      title: title.trim(),
      html_content: htmlContent.trim() || null,
      is_active: isActive,
    }

    if (editingItem) {
      const { error } = await supabase
        .from("custom_content")
        .update(itemData)
        .eq("id", editingItem.id)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from("custom_content").insert(itemData)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadItems()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this content?")) return
    
    const supabase = createClient()
    await supabase.from("custom_content").delete().eq("id", id)
    loadItems()
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Custom Content" 
        description="Create custom HTML content blocks"
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <Card className="py-12 text-center">
            <Code className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No custom content yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create custom HTML blocks for your displays.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={async () => {
                            const supabase = createClient()
                            await supabase
                              .from("custom_content")
                              .update({ is_active: !item.is_active })
                              .eq("id", item.id)
                            loadItems()
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Content" : "Add Content"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update your custom HTML content."
                : "Create a custom HTML content block."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Custom Widget"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="htmlContent">HTML Content</Label>
              <Textarea
                id="htmlContent"
                placeholder="<div>Your custom HTML here...</div>"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter raw HTML that will be rendered on your display.
              </p>
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
              {isSaving ? "Saving..." : editingItem ? "Save Changes" : "Add Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
