"use client"

import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export default function UnderUsersPage() {
  const { organizations, currentOrg, setCurrentOrg, isLoading } = useOrg()

  return (
    <div className="flex flex-col">
      <AdminHeader
        title="Under Users"
        description="Manage organization access and switching"
      />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                Accounts you can manage from this admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : organizations.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No organizations available for this account.
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {organizations.map((org) => (
                    <li
                      key={org.id}
                      className={`flex items-center justify-between rounded-md border p-3 ${
                        org.id === currentOrg?.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-xs text-muted-foreground">{org.slug}</p>
                        </div>
                      </div>
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
