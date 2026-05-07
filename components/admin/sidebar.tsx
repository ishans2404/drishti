"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Settings,
  LogOut,
  Building2,
  ChevronDown,
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

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/displays", label: "Displays", icon: Monitor },
  { href: "/admin/notices", label: "Notices", icon: FileText },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/timetable", label: "Timetable", icon: Clock },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/birthdays", label: "Birthdays", icon: Cake },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/holidays", label: "Holidays", icon: Palmtree },
  { href: "/admin/alerts", label: "Emergency Alerts", icon: AlertTriangle },
  { href: "/admin/custom", label: "Custom Content", icon: Code },
]

export function AdminSidebar() {
  const pathname = usePathname()
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
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">
          D
        </div>
        <span className="font-semibold text-lg">Drishti</span>
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
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
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
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </li>
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
