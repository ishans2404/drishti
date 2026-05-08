import { Building2, Plus } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { StatusMessage } from "@/components/admin/status-message"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createOrganizationAction, updateOrganizationAction } from "@/lib/actions/organization"
import { getAdminContext } from "@/lib/server-data"

export const dynamic = "force-dynamic"

export default async function OrganizationPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const context = await getAdminContext()

  return (
    <>
      <PageHeader
        title="Organization"
        description="Manage workspace branding and add additional organizations for multi-location switching."
      />
      <StatusMessage searchParams={params} />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[1fr_390px]">
        <Card>
          <CardHeader>
            <CardTitle>Current Organization</CardTitle>
          </CardHeader>
          <CardContent>
            {context.currentOrg ? (
              <form action={updateOrganizationAction} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">Name</label>
                    <Input id="name" name="name" defaultValue={context.currentOrg.name} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="slug">Slug</label>
                    <Input id="slug" name="slug" defaultValue={context.currentOrg.slug} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="primary_color">Primary color</label>
                    <Input id="primary_color" name="primary_color" type="color" defaultValue={context.currentOrg.primary_color} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="logo_url">Logo URL</label>
                    <Input id="logo_url" name="logo_url" defaultValue={context.currentOrg.logo_url || ""} placeholder="https://..." />
                  </div>
                </div>
                <Button type="submit">
                  <Building2 className="h-4 w-4" />
                  Save organization
                </Button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground">No organization selected.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createOrganizationAction} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="new-name">Name</label>
                  <Input id="new-name" name="name" placeholder="North Campus" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="new-slug">Slug</label>
                  <Input id="new-slug" name="slug" placeholder="north-campus" />
                </div>
                <Button className="w-full" type="submit">
                  <Plus className="h-4 w-4" />
                  Add organization
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspaces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {context.organizations.map((organization) => (
                <div key={organization.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <div className="font-medium">{organization.name}</div>
                    <div className="text-xs text-muted-foreground">/{organization.slug}</div>
                  </div>
                  {organization.id === context.currentOrg?.id ? <Badge variant="success">Selected</Badge> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
