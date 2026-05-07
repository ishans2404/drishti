"use client"

import { useOrg } from "@/lib/org-context"
import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  title: string
  description?: string
  onMenuClick?: () => void
}

export function AdminHeader({ title, description, onMenuClick }: AdminHeaderProps) {
  const { currentOrg } = useOrg()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-muted-foreground sm:block">
          {currentOrg?.name}
        </span>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
