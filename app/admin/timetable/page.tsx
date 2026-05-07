"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { Timetable } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Clock, Pencil, Trash2 } from "lucide-react"

export default function TimetablePage() {
  const { currentOrg } = useOrg()
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [dataJson, setDataJson] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    loadTimetables()
  }, [currentOrg])

  async function loadTimetables() {
    if (!currentOrg) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("timetables")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("created_at", { ascending: false })
    
    setTimetables(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setEditingTimetable(null)
    setTitle("")
    setDataJson(JSON.stringify({
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      slots: [
        { time: "09:00 - 10:00", monday: "Math", tuesday: "Science", wednesday: "English", thursday: "History", friday: "Art" },
        { time: "10:00 - 11:00", monday: "Science", tuesday: "Math", wednesday: "PE", thursday: "English", friday: "Math" },
      ]
    }, null, 2))
    setIsActive(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(timetable: Timetable) {
    setEditingTimetable(timetable)
    setTitle(timetable.title)
    setDataJson(JSON.stringify(timetable.data_json, null, 2))
    setIsActive(timetable.is_active)
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!currentOrg || !title.trim()) {
      setFormError("Title is required")
      return
    }

    let parsedData
    try {
      parsedData = JSON.parse(dataJson)
    } catch {
      setFormError("Invalid JSON format")
      return
    }

    setIsSaving(true)
    setFormError(null)
    const supabase = createClient()

    const timetableData = {
      organization_id: currentOrg.id,
      title: title.trim(),
      data_json: parsedData,
      is_active: isActive,
    }

    if (editingTimetable) {
      const { error } = await supabase
        .from("timetables")
        .update(timetableData)
        .eq("id", editingTimetable.id)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from("timetables").insert(timetableData)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadTimetables()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this timetable?")) return
    
    const supabase = createClient()
    await supabase.from("timetables").delete().eq("id", id)
    loadTimetables()
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Timetable" 
        description="Manage class schedules"
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {timetables.length} timetable{timetables.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Timetable
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : timetables.length === 0 ? (
          <Card className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No timetables yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a timetable to display schedules.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Timetable
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timetables.map((timetable) => (
              <Card key={timetable.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{timetable.title}</CardTitle>
                    <CardDescription>
                      {timetable.is_active ? "Active" : "Inactive"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(timetable)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(timetable.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(timetable.created_at).toLocaleDateString()}
                    </span>
                    <Switch
                      checked={timetable.is_active}
                      onCheckedChange={async () => {
                        const supabase = createClient()
                        await supabase
                          .from("timetables")
                          .update({ is_active: !timetable.is_active })
                          .eq("id", timetable.id)
                        loadTimetables()
                      }}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTimetable ? "Edit Timetable" : "Add Timetable"}
            </DialogTitle>
            <DialogDescription>
              {editingTimetable
                ? "Update the timetable details."
                : "Create a new timetable with JSON data."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Timetable Title</Label>
              <Input
                id="title"
                placeholder="Class 10A Schedule"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dataJson">Schedule Data (JSON)</Label>
              <Textarea
                id="dataJson"
                placeholder='{"days": [...], "slots": [...]}'
                value={dataJson}
                onChange={(e) => setDataJson(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter the timetable data in JSON format with days and time slots.
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
              {isSaving ? "Saving..." : editingTimetable ? "Save Changes" : "Add Timetable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
