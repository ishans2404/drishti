"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Clock,
  Image,
  Cake,
  Trophy,
  Palmtree,
  AlertTriangle,
  Code,
  Monitor,
  LogOut,
  Building2,
  ChevronDown,
  Users,
  Video,
  Music,
  ToggleLeft,
  LayoutTemplate,
  SlidersHorizontal,
  Settings,
} from "lucide-react"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  match?: {
    path: string
    type?: string
    mode?: string
  }
}

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "User Management",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/under-users", label: "Under Users", icon: Users },
    ],
  },
  {
    title: "Screen Management",
    items: [
      { href: "/admin/settings", label: "Screen Info", icon: Settings },
      {
        href: "/admin/gallery?type=header",
        label: "Header Right Side",
        icon: Image,
        match: { path: "/admin/gallery", type: "header" },
      },
      {
        href: "/admin/gallery?type=slider",
        label: "Image Slider",
        icon: SlidersHorizontal,
        match: { path: "/admin/gallery", type: "slider" },
      },
      { href: "/admin/notices", label: "Notice Board", icon: FileText },
      { href: "/admin/events", label: "News/Event Master", icon: Calendar },
      {
        href: "/admin/gallery?type=photo",
        label: "Photo Gallery",
        icon: Image,
        match: { path: "/admin/gallery", type: "photo" },
      },
      {
        href: "/admin/gallery?type=video",
        label: "Video Gallery",
        icon: Video,
        match: { path: "/admin/gallery", type: "video" },
      },
      {
        href: "/admin/gallery?type=audio",
        label: "Audio Master",
        icon: Music,
        match: { path: "/admin/gallery", type: "audio" },
      },
      {
        href: "/admin/displays?mode=sections",
        label: "Section Show/Hide",
        icon: ToggleLeft,
        match: { path: "/admin/displays", mode: "sections" },
      },
      { href: "/admin/template-preview", label: "Template Preview", icon: LayoutTemplate },
      {
        href: "/admin/custom?type=footer",
        label: "Footer Master",
        icon: FileText,
        match: { path: "/admin/custom", type: "footer" },
      },
    ],
  },
  {
    title: "Displays",
    items: [
      { href: "/admin/displays", label: "Manage Displays", icon: Monitor },
    ],
  },
  {
    title: "Additional",
    items: [
      { href: "/admin/timetable", label: "Timetable", icon: Clock },
      { href: "/admin/birthdays", label: "Birthdays", icon: Cake },
      { href: "/admin/achievements", label: "Achievements", icon: Trophy },
      { href: "/admin/holidays", label: "Holidays", icon: Palmtree },
      { href: "/admin/alerts", label: "Emergency Alerts", icon: AlertTriangle },
      { href: "/admin/custom", label: "Custom Content", icon: Code },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { organizations, currentOrg, setCurrentOrg } = useOrg()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
          EG
        </div>
        <div>
          <span className="font-bold text-base tracking-tight">EG Drishti</span>
          <p className="text-[10px] text-sidebar-foreground/40 leading-none mt-0.5">Digital Notice Board</p>
        </div>
      </div>

      {/* Org Switcher */}
      <div className="border-b border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{currentOrg?.name || "Select Organization"}</span>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setCurrentOrg(org)}
                className={cn(
                  "cursor-pointer",
                  currentOrg?.id === org.id && "bg-accent"
                )}
              >
                {org.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
              {section.title}
            </p>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const matchPath = item.match?.path || item.href.split("?")[0]
                const matchType = item.match?.type
                const matchMode = item.match?.mode
                const activeType = searchParams.get("type")
                const activeMode = searchParams.get("mode")
                const isActive =
                  pathname === matchPath &&
                  (matchType ? activeType === matchType : !activeType) &&
                  (matchMode ? activeMode === matchMode : !activeMode)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <ul className="flex flex-col gap-1">
          <li>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
