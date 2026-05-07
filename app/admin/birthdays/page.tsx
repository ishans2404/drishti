"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { Birthday } from "@/lib/types"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Cake, Pencil, Trash2 } from "lucide-react"

export default function BirthdaysPage() {
  const { currentOrg } = useOrg()
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [date, setDate] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    loadBirthdays()
  }, [currentOrg])

  async function loadBirthdays() {
    if (!currentOrg) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("birthdays")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("date", { ascending: true })
    
    setBirthdays(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setEditingBirthday(null)
    setName("")
    setDesignation("")
    setDate("")
    setPhotoUrl("")
    setIsActive(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(birthday: Birthday) {
    setEditingBirthday(birthday)
    setName(birthday.name)
    setDesignation(birthday.designation || "")
    setDate(birthday.date)
    setPhotoUrl(birthday.photo_url || "")
    setIsActive(birthday.is_active)
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!currentOrg || !name.trim() || !date) {
      setFormError("Name and date are required")
      return
    }

    setIsSaving(true)
    setFormError(null)
    const supabase = createClient()

    const birthdayData = {
      organization_id: currentOrg.id,
      name: name.trim(),
      designation: designation.trim() || null,
      date,
      photo_url: photoUrl.trim() || null,
      is_active: isActive,
    }

    if (editingBirthday) {
      const { error } = await supabase
        .from("birthdays")
        .update(birthdayData)
        .eq("id", editingBirthday.id)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from("birthdays").insert(birthdayData)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadBirthdays()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this birthday?")) return
    
    const supabase = createClient()
    await supabase.from("birthdays").delete().eq("id", id)
    loadBirthdays()
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Birthdays" 
        description="Manage birthday celebrations"
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {birthdays.length} birthday{birthdays.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Birthday
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : birthdays.length === 0 ? (
          <Card className="py-12 text-center">
            <Cake className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No birthdays yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add birthdays to celebrate on your displays.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Birthday
            </Button>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {birthdays.map((birthday) => (
                    <TableRow key={birthday.id}>
                      <TableCell className="font-medium">{birthday.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {birthday.designation || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(birthday.date)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={birthday.is_active}
                          onCheckedChange={async () => {
                            const supabase = createClient()
                            await supabase
                              .from("birthdays")
                              .update({ is_active: !birthday.is_active })
                              .eq("id", birthday.id)
                            loadBirthdays()
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(birthday)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(birthday.id)}
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
              {editingBirthday ? "Edit Birthday" : "Add Birthday"}
            </DialogTitle>
            <DialogDescription>
              {editingBirthday
                ? "Update birthday details."
                : "Add a birthday to celebrate."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="designation">Designation (optional)</Label>
              <Input
                id="designation"
                placeholder="Teacher, Student, Staff..."
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Birthday Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="photoUrl">Photo URL (optional)</Label>
              <Input
                id="photoUrl"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
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
              {isSaving ? "Saving..." : editingBirthday ? "Save Changes" : "Add Birthday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
