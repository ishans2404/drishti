"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { Notice } from "@/lib/types"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, FileText, Pencil, Trash2 } from "lucide-react"

const categories = ["general", "academic", "administrative", "urgent", "announcement"]

export default function NoticesPage() {
  const { currentOrg } = useOrg()
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [isActive, setIsActive] = useState(true)
  const [expiresAt, setExpiresAt] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    loadNotices()
  }, [currentOrg])

  async function loadNotices() {
    if (!currentOrg) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("notices")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("created_at", { ascending: false })
    
    setNotices(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setEditingNotice(null)
    setTitle("")
    setContent("")
    setCategory("general")
    setIsActive(true)
    setExpiresAt("")
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(notice: Notice) {
    setEditingNotice(notice)
    setTitle(notice.title)
    setContent(notice.content || "")
    setCategory(notice.category)
    setIsActive(notice.is_active)
    setExpiresAt(notice.expires_at ? notice.expires_at.split("T")[0] : "")
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

    const noticeData = {
      organization_id: currentOrg.id,
      title: title.trim(),
      content: content.trim() || null,
      category,
      is_active: isActive,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    }

    if (editingNotice) {
      const { error } = await supabase
        .from("notices")
        .update(noticeData)
        .eq("id", editingNotice.id)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from("notices").insert(noticeData)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadNotices()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this notice?")) return
    
    const supabase = createClient()
    await supabase.from("notices").delete().eq("id", id)
    loadNotices()
  }

  async function handleToggleActive(notice: Notice) {
    const supabase = createClient()
    await supabase
      .from("notices")
      .update({ is_active: !notice.is_active })
      .eq("id", notice.id)
    loadNotices()
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Notices" 
        description="Manage announcements and notices"
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {notices.length} notice{notices.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Notice
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : notices.length === 0 ? (
          <Card className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No notices yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first notice to display on your boards.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Notice
            </Button>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize">
                          {notice.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={notice.is_active}
                          onCheckedChange={() => handleToggleActive(notice)}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {notice.expires_at
                          ? new Date(notice.expires_at).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(notice)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(notice.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNotice ? "Edit Notice" : "Add Notice"}
            </DialogTitle>
            <DialogDescription>
              {editingNotice
                ? "Update the notice details."
                : "Create a new notice to display."}
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
                placeholder="Notice title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Notice content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="expires">Expires On (optional)</Label>
              <Input
                id="expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
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
              {isSaving ? "Saving..." : editingNotice ? "Save Changes" : "Add Notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
