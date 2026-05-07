"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import type { EmergencyAlert } from "@/lib/types"
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
import { Plus, AlertTriangle, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const alertTypes = [
  { value: "info", label: "Info", color: "bg-blue-500" },
  { value: "warning", label: "Warning", color: "bg-yellow-500" },
  { value: "critical", label: "Critical", color: "bg-red-500" },
]

export default function AlertsPage() {
  const { currentOrg } = useOrg()
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<EmergencyAlert | null>(null)

  // Form state
  const [message, setMessage] = useState("")
  const [alertType, setAlertType] = useState<"info" | "warning" | "critical">("warning")
  const [isActive, setIsActive] = useState(true)
  const [expiresAt, setExpiresAt] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    loadAlerts()
  }, [currentOrg])

  async function loadAlerts() {
    if (!currentOrg) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("emergency_alerts")
      .select("*")
      .eq("organization_id", currentOrg.id)
      .order("created_at", { ascending: false })
    
    setAlerts(data || [])
    setIsLoading(false)
  }

  function openCreateModal() {
    setEditingAlert(null)
    setMessage("")
    setAlertType("warning")
    setIsActive(true)
    setExpiresAt("")
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(alert: EmergencyAlert) {
    setEditingAlert(alert)
    setMessage(alert.message)
    setAlertType(alert.alert_type)
    setIsActive(alert.is_active)
    setExpiresAt(alert.expires_at ? alert.expires_at.split("T")[0] : "")
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!currentOrg || !message.trim()) {
      setFormError("Message is required")
      return
    }

    setIsSaving(true)
    setFormError(null)
    const supabase = createClient()

    const alertData = {
      organization_id: currentOrg.id,
      message: message.trim(),
      alert_type: alertType,
      is_active: isActive,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    }

    if (editingAlert) {
      const { error } = await supabase
        .from("emergency_alerts")
        .update(alertData)
        .eq("id", editingAlert.id)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from("emergency_alerts").insert(alertData)

      if (error) {
        setFormError(error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setIsModalOpen(false)
    loadAlerts()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this alert?")) return
    
    const supabase = createClient()
    await supabase.from("emergency_alerts").delete().eq("id", id)
    loadAlerts()
  }

  function getAlertColor(type: string) {
    return alertTypes.find((t) => t.value === type)?.color || "bg-muted"
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Emergency Alerts" 
        description="Manage urgent announcements"
      />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Alert
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : alerts.length === 0 ? (
          <Card className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No alerts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an emergency alert when needed.
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Alert
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="overflow-hidden">
                <div className="flex">
                  <div className={cn("w-2", getAlertColor(alert.alert_type))} />
                  <CardContent className="flex flex-1 items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium capitalize text-white",
                            getAlertColor(alert.alert_type)
                          )}
                        >
                          {alert.alert_type}
                        </span>
                        {!alert.is_active && (
                          <span className="text-xs text-muted-foreground">
                            (Inactive)
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-medium">{alert.message}</p>
                      {alert.expires_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Expires: {new Date(alert.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={async () => {
                          const supabase = createClient()
                          await supabase
                            .from("emergency_alerts")
                            .update({ is_active: !alert.is_active })
                            .eq("id", alert.id)
                          loadAlerts()
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(alert)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
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
              {editingAlert ? "Edit Alert" : "Add Alert"}
            </DialogTitle>
            <DialogDescription>
              {editingAlert
                ? "Update the emergency alert."
                : "Create an emergency alert for display."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="alertType">Alert Type</Label>
              <Select value={alertType} onValueChange={(v) => setAlertType(v as "info" | "warning" | "critical")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alertTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", t.color)} />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Alert Message</Label>
              <Textarea
                id="message"
                placeholder="Important announcement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
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
              {isSaving ? "Saving..." : editingAlert ? "Save Changes" : "Add Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
