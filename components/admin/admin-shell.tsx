"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  ChevronDown,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Monitor,
  PanelLeft,
  Palette,
  ScreenShare,
  Settings,
  Sparkles,
  SunMoon
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { signOutAction } from "@/lib/actions/auth"
import type { Organization } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn, getInitials } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/displays", label: "Displays", icon: Monitor },
  { href: "/admin/displays", label: "Builder", icon: ScreenShare },
  { href: "/admin/content", label: "Content Library", icon: FileText },
  { href: "/admin/media", label: "Media Library", icon: Images },
  { href: "/admin/templates", label: "Templates", icon: Palette },
  { href: "/admin/organization", label: "Organization", icon: Settings }
]

export function AdminShell({
  organizations,
  currentOrg,
  children
}: {
  organizations: Organization[]
  currentOrg: Organization | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function selectOrganization(id: string) {
    document.cookie = `drishti_org_id=${id}; path=/; SameSite=Lax`
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            DR
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Drishti</div>
            <div className="text-xs text-muted-foreground">Digital notice boards</div>
          </div>
        </div>

        <div className="border-b border-border p-4">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={currentOrg?.id || ""}
              onChange={(event) => selectOrganization(event.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active =
              item.label === "Builder"
                ? pathname.includes("/builder")
                : pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(`${item.href}/`) && !pathname.includes("/builder"))
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-md bg-muted p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
              {getInitials(currentOrg?.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{currentOrg?.name || "No organization"}</div>
              <div className="truncate text-xs text-muted-foreground">/{currentOrg?.slug || "workspace"}</div>
            </div>
          </div>
          <form action={signOutAction}>
            <Button variant="outline" className="w-full justify-start" type="submit">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="h-5 w-5" />
            </Button>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Single-page kiosk displays, managed centrally.</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <SunMoon className="h-4 w-4" />
            Theme
          </Button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
