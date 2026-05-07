"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { Display, ModuleType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Copy, ExternalLink, Trash2, Pencil, Monitor, Check } from "lucide-react"

const moduleOptions: { value: ModuleType; label: string }[] = [
  { value: "notices", label: "Notice Board" },
  { value: "events", label: "News/Event Master" },
  { value: "timetable", label: "Timetable" },
  { value: "gallery", label: "Photo Gallery" },
  { value: "birthdays", label: "Birthdays" },
  { value: "achievements", label: "Achievements" },
  { value: "holidays", label: "Holidays" },
  { value: "alerts", label: "Emergency Alerts" },
  { value: "custom", label: "Custom Content" },
]

export default function DisplaysPage() {
  const { currentOrg } = useOrg()
  const searchParams = useSearchParams()
  const isSectionMode = searchParams.get("mode") === "sections"
  const [displays, setDisplays] = useState<Display[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDisplay, setEditingDisplay] = useState<Display | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>(["notices", "events", "gallery"])
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    loadDisplays()
  }, [currentOrg])

  async function loadDisplays() {
    if (!currentOrg) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("displays")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("created_at", { ascending: false })
    
    setDisplays(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setEditingDisplay(null)
    setName("")
    setSlug("")
    setSelectedModules(["notices", "events", "gallery"])
    setIsActive(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(display: Display) {
    setEditingDisplay(display)
    setName(display.name)
    setSlug(display.slug)
    setSelectedModules(display.layout_config.modules as ModuleType[])
    setIsActive(display.is_active)
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!currentOrg || !name.trim() || !slug.trim()) {
      setFormError("Name and slug are required")
      return
    }

    setIsSaving(true)
    setFormError(null)
    const supabase = createClient()

    const displayData = {
      organization_id: currentOrg.id,
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      layout_config: { modules: selectedModules },
      is_active: isActive,
    }

    if (editingDisplay) {
      const { error } = await supabase
        .from("displays")
        .update(displayData)
        .eq("id", editingDisplay.id)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from("displays")
        .insert(displayData)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadDisplays()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this display?")) return
    
    const supabase = createClient()
    await supabase.from("displays").delete().eq("id", id)
    loadDisplays()
  }

  async function handleToggleActive(display: Display) {
    const supabase = createClient()
    await supabase
      .from("displays")
      .update({ is_active: !display.is_active })
      .eq("id", display.id)
    loadDisplays()
  }

  function copyLink(slug: string, id: string) {
    const url = `${window.location.origin}/display/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function generateSlug(displayName: string) {
    setSlug(displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title={isSectionMode ? "Section Show/Hide" : "Displays"} 
        description={
          isSectionMode
            ? "Enable or disable sections for each display"
            : "Manage your digital display boards"
        }
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {isSectionMode
                ? "Toggle which modules appear on each display."
                : "Create displays and share the public links with anyone."}
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Create Display
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : displays.length === 0 ? (
          <Card className="py-12 text-center">
            <Monitor className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No displays yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first digital display board to get started.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Display
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displays.map((display) => (
              <Card key={display.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        display.is_active ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                    <div>
                      <CardTitle className="text-base">{display.name}</CardTitle>
                      <CardDescription className="text-xs">
                        /{display.slug}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(display)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyLink(display.slug, display.id)}>
                        {copiedId === display.id ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        {copiedId === display.id ? "Copied!" : "Copy Link"}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/display/${display.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Display
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(display.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {display.layout_config.modules.map((mod) => (
                      <span
                        key={mod}
                        className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {display.is_active ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={display.is_active}
                      onCheckedChange={() => handleToggleActive(display)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDisplay ? "Edit Display" : "Create Display"}
            </DialogTitle>
            <DialogDescription>
              {editingDisplay
                ? "Update your display board settings."
                : "Create a new digital display board."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Main Lobby Display"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!editingDisplay) generateSlug(e.target.value)
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/display/</span>
                <Input
                  id="slug"
                  placeholder="main-lobby"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={!!editingDisplay}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Content Modules</Label>
              <div className="grid grid-cols-2 gap-2">
                {moduleOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={option.value}
                      checked={selectedModules.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedModules([...selectedModules, option.value])
                        } else {
                          setSelectedModules(selectedModules.filter((m) => m !== option.value))
                        }
                      }}
                    />
                    <Label htmlFor={option.value} className="text-sm font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
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
              {isSaving ? "Saving..." : editingDisplay ? "Save Changes" : "Create Display"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
