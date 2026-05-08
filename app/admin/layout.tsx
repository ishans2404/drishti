import { AdminShell } from "@/components/admin/admin-shell"
import { getAdminContext } from "@/lib/server-data"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const context = await getAdminContext()

  return (
    <AdminShell organizations={context.organizations} currentOrg={context.currentOrg}>
      {children}
    </AdminShell>
  )
}
