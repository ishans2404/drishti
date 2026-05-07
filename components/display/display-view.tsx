"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  Display,
  Notice,
  Event,
  GalleryItem,
  Birthday,
  Achievement,
  Holiday,
  EmergencyAlert,
  Timetable,
  CustomContent,
  Organization,
} from "@/lib/types"
import { NoticesModule } from "./modules/notices-module"
import { EventsModule } from "./modules/events-module"
import { GalleryModule } from "./modules/gallery-module"
import { BirthdaysModule } from "./modules/birthdays-module"
import { AchievementsModule } from "./modules/achievements-module"
import { HolidaysModule } from "./modules/holidays-module"
import { AlertsModule } from "./modules/alerts-module"
import { TimetableModule } from "./modules/timetable-module"
import { CustomModule } from "./modules/custom-module"
import { Clock } from "./clock"

interface DisplayData {
  display: Display & { organizations: Organization }
  notices: Notice[]
  events: Event[]
  gallery: GalleryItem[]
  birthdays: Birthday[]
  achievements: Achievement[]
  holidays: Holiday[]
  alerts: EmergencyAlert[]
  timetables: Timetable[]
  customContent: CustomContent[]
}

interface DisplayViewProps {
  initialData: DisplayData
}

export function DisplayView({ initialData }: DisplayViewProps) {
  const [data, setData] = useState(initialData)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)

  const enabledModules = data.display.layout_config.modules

  // Auto-rotate modules every 15 seconds
  useEffect(() => {
    if (enabledModules.length <= 1) return

    const interval = setInterval(() => {
      setCurrentModuleIndex((prev) => (prev + 1) % enabledModules.length)
    }, 15000)

    return () => clearInterval(interval)
  }, [enabledModules.length])

  // Real-time updates via Supabase
  useEffect(() => {
    const supabase = createClient()
    const orgId = data.display.organization_id

    // Subscribe to all content tables
    const channel = supabase
      .channel("display-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notices", filter: `organization_id=eq.${orgId}` },
        async () => {
          const { data: notices } = await supabase.from("notices").select("*").eq("organization_id", orgId).eq("is_active", true).order("display_order")
          setData((prev) => ({ ...prev, notices: notices || [] }))
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `organization_id=eq.${orgId}` },
        async () => {
          const { data: events } = await supabase.from("events").select("*").eq("organization_id", orgId).eq("is_active", true).order("start_date")
          setData((prev) => ({ ...prev, events: events || [] }))
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery", filter: `organization_id=eq.${orgId}` },
        async () => {
          const { data: gallery } = await supabase.from("gallery").select("*").eq("organization_id", orgId).eq("is_active", true).order("display_order")
          setData((prev) => ({ ...prev, gallery: gallery || [] }))
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergency_alerts", filter: `organization_id=eq.${orgId}` },
        async () => {
          const { data: alerts } = await supabase.from("emergency_alerts").select("*").eq("organization_id", orgId).eq("is_active", true).order("created_at", { ascending: false })
          setData((prev) => ({ ...prev, alerts: alerts || [] }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [data.display.organization_id])

  const currentModule = enabledModules[currentModuleIndex]

  function renderModule(moduleName: string) {
    switch (moduleName) {
      case "notices":
        return <NoticesModule notices={data.notices} />
      case "events":
        return <EventsModule events={data.events} />
      case "gallery":
        return <GalleryModule items={data.gallery} />
      case "birthdays":
        return <BirthdaysModule birthdays={data.birthdays} />
      case "achievements":
        return <AchievementsModule achievements={data.achievements} />
      case "holidays":
        return <HolidaysModule holidays={data.holidays} />
      case "alerts":
        return <AlertsModule alerts={data.alerts} />
      case "timetable":
        return <TimetableModule timetable={data.timetables[0]} />
      case "custom":
        return <CustomModule items={data.customContent} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Emergency Alerts Banner */}
      {data.alerts.length > 0 && data.alerts.some((a) => a.alert_type === "critical") && (
        <div className="animate-pulse bg-red-600 px-4 py-2 text-center font-semibold">
          {data.alerts.find((a) => a.alert_type === "critical")?.message}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl font-bold">
            D
          </div>
          <div>
            <h1 className="text-xl font-semibold">{data.display.organizations?.name}</h1>
            <p className="text-sm text-white/60">{data.display.name}</p>
          </div>
        </div>
        <Clock />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-8">
        <div className="h-full rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
          {renderModule(currentModule)}
        </div>
      </main>

      {/* Footer with module indicators */}
      <footer className="flex items-center justify-center gap-2 border-t border-white/10 bg-white/5 px-8 py-3">
        {enabledModules.map((mod, index) => (
          <button
            key={mod}
            onClick={() => setCurrentModuleIndex(index)}
            className={`h-2 w-8 rounded-full transition-all ${
              index === currentModuleIndex
                ? "bg-white"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </footer>
    </div>
  )
}
