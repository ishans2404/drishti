"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { Holiday } from "@/lib/types"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Palmtree, Pencil, Trash2 } from "lucide-react"

const holidayTypes = ["holiday", "vacation", "festival", "observance"]

export default function HolidaysPage() {
  const { currentOrg } = useOrg()
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [type, setType] = useState("holiday")
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    loadHolidays()
  }, [currentOrg])

  async function loadHolidays() {
    if (!currentOrg) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("holidays")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("date", { ascending: true })
    
    setHolidays(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setEditingHoliday(null)
    setName("")
    setDate("")
    setType("holiday")
    setIsActive(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(holiday: Holiday) {
    setEditingHoliday(holiday)
    setName(holiday.name)
    setDate(holiday.date)
    setType(holiday.type)
    setIsActive(holiday.is_active)
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

    const holidayData = {
      organization_id: currentOrg.id,
      name: name.trim(),
      date,
      type,
      is_active: isActive,
    }

    if (editingHoliday) {
      const { error } = await supabase
        .from("holidays")
        .update(holidayData)
        .eq("id", editingHoliday.id)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from("holidays").insert(holidayData)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadHolidays()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this holiday?")) return
    
    const supabase = createClient()
    await supabase.from("holidays").delete().eq("id", id)
    loadHolidays()
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Holidays" 
        description="Manage holidays and observances"
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {holidays.length} holiday{holidays.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : holidays.length === 0 ? (
          <Card className="py-12 text-center">
            <Palmtree className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No holidays yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add holidays to display on your boards.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Holiday
            </Button>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holiday</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(holiday.date)}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize">
                          {holiday.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={holiday.is_active}
                          onCheckedChange={async () => {
                            const supabase = createClient()
                            await supabase
                              .from("holidays")
                              .update({ is_active: !holiday.is_active })
                              .eq("id", holiday.id)
                            loadHolidays()
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(holiday)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(holiday.id)}
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
              {editingHoliday ? "Edit Holiday" : "Add Holiday"}
            </DialogTitle>
            <DialogDescription>
              {editingHoliday
                ? "Update holiday details."
                : "Add a holiday or observance."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Holiday Name</Label>
              <Input
                id="name"
                placeholder="New Year's Day"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {holidayTypes.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isSaving ? "Saving..." : editingHoliday ? "Save Changes" : "Add Holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
