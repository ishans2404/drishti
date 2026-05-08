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
  SunMoon
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { signOutAction } from "@/lib/actions/auth"
import type { Organization } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn, getInitials } from "@/lib/utils"

const navGroups = [
  {
    label: "Dashboard",
    items: [
      { href: "/admin",       label: "Overview",         icon: LayoutDashboard }
    ]
  },
  {
    label: "Displays",
    items: [
      { href: "/admin/displays",   label: "Manage Displays", icon: Monitor },
      { href: "/admin/displays",   label: "Builder",          icon: ScreenShare, matchBuilder: true },
      { href: "/admin/templates",  label: "Templates",        icon: Palette }
    ]
  },
  {
    label: "Content",
    items: [
      { href: "/admin/content", label: "Content Library", icon: FileText },
      { href: "/admin/media",   label: "Media Library",   icon: Images }
    ]
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/organization", label: "Organization", icon: Building2 }
    ]
  }
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
  const router   = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function selectOrganization(id: string) {
    document.cookie = `drishti_org_id=${id}; path=/; SameSite=Lax`
    router.refresh()
  }

  function isActive(href: string, matchBuilder?: boolean) {
    if (matchBuilder) return pathname.includes("/builder")
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href + "/") || pathname === href
      ? !pathname.includes("/builder") || matchBuilder
      : false
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col",
          "border-r transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div
          className="flex h-14 items-center gap-3 px-4 border-b"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            DR
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">DRISHTI</div>
            <div className="text-[10px]" style={{ color: "var(--sidebar-fg)" }}>
              Digital Notice Board System
            </div>
          </div>
        </div>

        {/* Org switcher */}
        <div className="px-3 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div
            className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--sidebar-fg)", opacity: 0.6 }}
          >
            Organization
          </div>
          <div className="relative">
            <Building2
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: "var(--sidebar-fg)" }}
            />
            <select
              value={currentOrg?.id || ""}
              onChange={(e) => selectOrganization(e.target.value)}
              className="h-8 w-full appearance-none rounded border pl-8 pr-7 text-xs outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderColor: "var(--sidebar-border)",
                color: "#fff"
              }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id} style={{ background: "#0f2347", color: "#fff" }}>
                  {org.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2"
              style={{ color: "var(--sidebar-fg)" }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div
                className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--sidebar-fg)", opacity: 0.45 }}
              >
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.matchBuilder)
                  return (
                    <Link
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn("sidebar-link", active && "active")}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t p-3" style={{ borderColor: "var(--sidebar-border)" }}>
          <div
            className="mb-2 flex items-center gap-2 rounded px-2 py-2"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] font-bold"
              style={{ background: "var(--sidebar-active-bg)", color: "#fff" }}
            >
              {getInitials(currentOrg?.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">
                {currentOrg?.name || "No organization"}
              </div>
              <div className="truncate text-[10px]" style={{ color: "var(--sidebar-fg)", opacity: 0.6 }}>
                /{currentOrg?.slug || "workspace"}
              </div>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors hover:bg-white/10"
              style={{ color: "var(--sidebar-fg)" }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            {/* Breadcrumb path */}
            <span className="hidden text-xs text-muted-foreground sm:block">
              {currentOrg?.name || "Drishti"} &rsaquo; Digital Signage Management
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <SunMoon className="h-4 w-4" />
            <span className="hidden sm:inline">
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </Button>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}