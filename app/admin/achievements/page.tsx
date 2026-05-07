"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { Achievement } from "@/lib/types"
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
import { Plus, Trophy, Pencil, Trash2 } from "lucide-react"

export default function AchievementsPage() {
  const { currentOrg } = useOrg()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [personName, setPersonName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [date, setDate] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    loadAchievements()
  }, [currentOrg])

  async function loadAchievements() {
    if (!currentOrg) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("created_at", { ascending: false })
    
    setAchievements(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setEditingAchievement(null)
    setTitle("")
    setDescription("")
    setPersonName("")
    setImageUrl("")
    setDate("")
    setIsActive(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(achievement: Achievement) {
    setEditingAchievement(achievement)
    setTitle(achievement.title)
    setDescription(achievement.description || "")
    setPersonName(achievement.person_name || "")
    setImageUrl(achievement.image_url || "")
    setDate(achievement.date || "")
    setIsActive(achievement.is_active)
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

    const achievementData = {
      organization_id: currentOrg.id,
      title: title.trim(),
      description: description.trim() || null,
      person_name: personName.trim() || null,
      image_url: imageUrl.trim() || null,
      date: date || null,
      is_active: isActive,
    }

    if (editingAchievement) {
      const { error } = await supabase
        .from("achievements")
        .update(achievementData)
        .eq("id", editingAchievement.id)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from("achievements").insert(achievementData)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadAchievements()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this achievement?")) return
    
    const supabase = createClient()
    await supabase.from("achievements").delete().eq("id", id)
    loadAchievements()
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Achievements" 
        description="Celebrate successes and milestones"
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {achievements.length} achievement{achievements.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Achievement
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : achievements.length === 0 ? (
          <Card className="py-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No achievements yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add achievements to showcase on your displays.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Person</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((achievement) => (
                    <TableRow key={achievement.id}>
                      <TableCell className="font-medium">{achievement.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {achievement.person_name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {achievement.date
                          ? new Date(achievement.date + "T00:00:00").toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={achievement.is_active}
                          onCheckedChange={async () => {
                            const supabase = createClient()
                            await supabase
                              .from("achievements")
                              .update({ is_active: !achievement.is_active })
                              .eq("id", achievement.id)
                            loadAchievements()
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(achievement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(achievement.id)}
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
              {editingAchievement ? "Edit Achievement" : "Add Achievement"}
            </DialogTitle>
            <DialogDescription>
              {editingAchievement
                ? "Update achievement details."
                : "Add an achievement to showcase."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Achievement Title</Label>
              <Input
                id="title"
                placeholder="First place in Science Fair"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="personName">Person/Team Name (optional)</Label>
              <Input
                id="personName"
                placeholder="John Doe"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Achievement description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date (optional)</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
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
              {isSaving ? "Saving..." : editingAchievement ? "Save Changes" : "Add Achievement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
