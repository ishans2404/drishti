"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { useOrg } from "@/lib/org-context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Monitor,
  FileText,
  Calendar,
  Image,
  Plus,
  ExternalLink,
} from "lucide-react"

interface DashboardStats {
  displays: number
  notices: number
  events: number
  gallery: number
}

export default function AdminDashboardPage() {
  const { currentOrg, isLoading: orgLoading } = useOrg()
  const [stats, setStats] = useState<DashboardStats>({
    displays: 0,
    notices: 0,
    events: 0,
    gallery: 0,
  })
  const [recentDisplays, setRecentDisplays] = useState<Array<{ id: string; name: string; slug: string; is_active: boolean }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentOrg) return

    async function loadDashboard() {
      setIsLoading(true)
      const supabase = createClient()

      const [displaysRes, noticesRes, eventsRes, galleryRes] = await Promise.all([
        supabase.from("displays").select("id, name, slug, is_active").eq("organization_id", currentOrg.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("notices").select("id").eq("organization_id", currentOrg.id).eq("is_active", true),
        supabase.from("events").select("id").eq("organization_id", currentOrg.id).eq("is_active", true),
        supabase.from("gallery").select("id").eq("organization_id", currentOrg.id).eq("is_active", true),
      ])

      setStats({
        displays: displaysRes.data?.length || 0,
        notices: noticesRes.data?.length || 0,
        events: eventsRes.data?.length || 0,
        gallery: galleryRes.data?.length || 0,
      })

      setRecentDisplays(displaysRes.data || [])
      setIsLoading(false)
    }

    loadDashboard()
  }, [currentOrg])

  if (orgLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Dashboard" 
        description="Welcome to Admin Panel"
      />
      
      <div className="flex-1 p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Displays
              </CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.displays}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Notices
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.notices}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.events}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gallery Items
              </CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.gallery}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Displays */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get started</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild className="justify-start">
                <Link href="/admin/displays">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Display
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/notices">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Notice Board Item
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/events">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add News/Event
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/gallery?type=photo">
                  <Image className="mr-2 h-4 w-4" />
                  Upload to Photo Gallery
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Displays</CardTitle>
              <CardDescription>
                Recently created display boards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : recentDisplays.length === 0 ? (
                <div className="py-8 text-center">
                  <Monitor className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No displays yet. Create your first display board.
                  </p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/admin/displays">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Display
                    </Link>
                  </Button>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentDisplays.map((display) => (
                    <li
                      key={display.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            display.is_active ? "bg-green-500" : "bg-muted"
                          }`}
                        />
                        <span className="font-medium">{display.name}</span>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/display/${display.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
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
