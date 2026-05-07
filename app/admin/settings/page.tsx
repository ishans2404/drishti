"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const { currentOrg, organizations, setCurrentOrg } = useOrg()
  const [orgName, setOrgName] = useState(currentOrg?.name || "")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSaveOrg() {
    if (!currentOrg || !orgName.trim()) return

    setIsSaving(true)
    setMessage(null)
    const supabase = createClient()

    const { error } = await supabase
      .from("organizations")
      .update({ name: orgName.trim() })
      .eq("id", currentOrg.id)

    if (error) {
      setMessage({ type: "error", text: error.message })
    } else {
      setMessage({ type: "success", text: "Organization updated successfully" })
      // Update local state
      const updatedOrg = { ...currentOrg, name: orgName.trim() }
      setCurrentOrg(updatedOrg)
    }
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Settings" 
        description="Manage your organization settings"
      />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Update your organization information
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {message && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="My Organization"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Organization ID</Label>
                <Input value={currentOrg?.id || ""} disabled className="bg-muted" />
              </div>

              <div className="flex flex-col gap-2">
                <Label>URL Slug</Label>
                <Input value={currentOrg?.slug || ""} disabled className="bg-muted" />
              </div>

              <Button onClick={handleSaveOrg} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Organizations</CardTitle>
              <CardDescription>
                Organizations you have access to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {organizations.map((org) => (
                  <li
                    key={org.id}
                    className={`flex items-center justify-between rounded-md border p-3 ${
                      org.id === currentOrg?.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <span className="font-medium">{org.name}</span>
                    {org.id === currentOrg?.id ? (
                      <span className="text-xs text-muted-foreground">Current</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentOrg(org)}
                      >
                        Switch
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
