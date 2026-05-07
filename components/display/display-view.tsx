"use client"

import { useEffect, useState, useCallback } from "react"
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

const SLIDE_DURATION = 10000 // 10 seconds per slide

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)

  const enabledModules = data.display.layout_config?.modules || []

  // Build slides — only modules that have content
  const slides = enabledModules.filter((mod) => {
    switch (mod) {
      case "notices": return data.notices.length > 0
      case "events": return data.events.length > 0
      case "gallery": return data.gallery.length > 0
      case "birthdays": return data.birthdays.length > 0
      case "achievements": return data.achievements.length > 0
      case "holidays": return data.holidays.length > 0
      case "alerts": return data.alerts.length > 0
      case "timetable": return data.timetables.length > 0
      case "custom": return data.customContent.length > 0
      default: return false
    }
  })

  const totalSlides = slides.length

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (totalSlides || 1))
    setProgress(0)
  }, [totalSlides])

  // Progress bar + auto-advance
  useEffect(() => {
    if (totalSlides <= 1) return
    setProgress(0)
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100)
      setProgress(pct)
      if (elapsed >= SLIDE_DURATION) {
        clearInterval(tick)
        nextSlide()
      }
    }, 50)
    return () => clearInterval(tick)
  }, [currentSlide, nextSlide, totalSlides])

  // Real-time Supabase updates
  useEffect(() => {
    const supabase = createClient()
    const orgId = data.display.organization_id
    const channel = supabase
      .channel("display-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "notices", filter: `organization_id=eq.${orgId}` },
        async () => {
          const { data: notices } = await supabase.from("notices").select("*").eq("organization_id", orgId).eq("is_active", true).order("display_order")
          setData((prev) => ({ ...prev, notices: notices || [] }))
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "events", filter: `organization_id=eq.${orgId}` },
        async () => {
          const { data: events } = await supabase.from("events").select("*").eq("organization_id", orgId).eq("is_active", true).order("start_date")
          setData((prev) => ({ ...prev, events: events || [] }))
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_alerts", filter: `organization_id=eq.${orgId}` },
        async () => {
          const { data: alerts } = await supabase.from("emergency_alerts").select("*").eq("organization_id", orgId).eq("is_active", true).order("created_at", { ascending: false })
          setData((prev) => ({ ...prev, alerts: alerts || [] }))
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [data.display.organization_id])

  function renderModule(moduleName: string) {
    switch (moduleName) {
      case "notices": return <NoticesModule notices={data.notices} />
      case "events": return <EventsModule events={data.events} />
      case "gallery": return <GalleryModule items={data.gallery} />
      case "birthdays": return <BirthdaysModule birthdays={data.birthdays} />
      case "achievements": return <AchievementsModule achievements={data.achievements} />
      case "holidays": return <HolidaysModule holidays={data.holidays} />
      case "alerts": return <AlertsModule alerts={data.alerts} />
      case "timetable": return <TimetableModule timetable={data.timetables[0]} />
      case "custom": return <CustomModule items={data.customContent} />
      default: return null
    }
  }

  const criticalAlert = data.alerts.find((a) => a.alert_type === "critical" && a.is_active)

  if (totalSlides === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white/40 text-xl">
        No active content to display.
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white overflow-hidden">
      {/* Critical alert banner */}
      {criticalAlert && (
        <div className="shrink-0 bg-red-600 px-6 py-2 text-center text-sm font-semibold animate-pulse">
          🚨 {criticalAlert.message}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-slate-800 shrink-0">
        {totalSlides > 1 && (
          <div
            className="h-full bg-blue-500 transition-none"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-sm shrink-0">
            EG
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{data.display.organizations?.name}</h1>
            <p className="text-xs text-white/40">{data.display.name}</p>
          </div>
        </div>
        <Clock />
      </header>

      {/* Main content — single module, full height */}
      <main className="flex-1 min-h-0 px-8 py-6 overflow-hidden">
        <div className="h-full">
          {renderModule(slides[currentSlide])}
        </div>
      </main>

      {/* Footer — dot navigation */}
      {totalSlides > 1 && (
        <footer className="shrink-0 flex items-center justify-center gap-2 py-3 border-t border-white/5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentSlide(i); setProgress(0) }}
              className={`rounded-full transition-all ${
                i === currentSlide
                  ? "w-6 h-2 bg-blue-500"
                  : "w-2 h-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </footer>
      )}
    </div>
  )
}
