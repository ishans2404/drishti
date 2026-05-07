"use client"

import type { Holiday } from "@/lib/types"
import { Palmtree, Calendar } from "lucide-react"

interface HolidaysModuleProps {
  holidays: Holiday[]
}

export function HolidaysModule({ holidays }: HolidaysModuleProps) {
  // Filter to upcoming holidays
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingHolidays = holidays.filter((h) => {
    const holidayDate = new Date(h.date + "T00:00:00")
    return holidayDate >= today
  }).slice(0, 8)

  if (upcomingHolidays.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <Palmtree className="mb-4 h-16 w-16" />
        <p className="text-xl">No upcoming holidays</p>
      </div>
    )
  }

  function getDaysUntil(dateStr: string) {
    const holidayDate = new Date(dateStr + "T00:00:00")
    const diffTime = holidayDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <Palmtree className="h-8 w-8 text-emerald-400" />
        Upcoming Holidays
      </h2>
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {upcomingHolidays.map((holiday) => {
            const daysUntil = getDaysUntil(holiday.date)
            const holidayDate = new Date(holiday.date + "T00:00:00")

            return (
              <div
                key={holiday.id}
                className="flex flex-col items-center rounded-xl bg-white/10 p-5 text-center"
              >
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <Calendar className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="font-semibold">{holiday.name}</h3>
                <p className="mt-1 text-sm text-white/60">
                  {holidayDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                  {daysUntil === 0
                    ? "Today!"
                    : daysUntil === 1
                    ? "Tomorrow"
                    : `In ${daysUntil} days`}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
