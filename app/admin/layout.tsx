import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrgProvider } from "@/lib/org-context"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <OrgProvider>
      <div className="flex h-screen bg-background">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </OrgProvider>
  )
}
