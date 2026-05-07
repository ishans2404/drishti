"use client"

import type { Timetable } from "@/lib/types"
import { Clock } from "lucide-react"

interface TimetableModuleProps {
  timetable?: Timetable
}

interface TimetableData {
  days?: string[]
  slots?: Array<{
    time: string
    [key: string]: string
  }>
}

export function TimetableModule({ timetable }: TimetableModuleProps) {
  if (!timetable) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <Clock className="mb-4 h-16 w-16" />
        <p className="text-xl">No timetable available</p>
      </div>
    )
  }

  const data = timetable.data_json as TimetableData
  const days = data.days || []
  const slots = data.slots || []

  if (days.length === 0 || slots.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <Clock className="mb-4 h-16 w-16" />
        <p className="text-xl">Timetable data is empty</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <Clock className="h-8 w-8 text-cyan-400" />
        {timetable.title}
      </h2>
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="sticky top-0 bg-slate-800 p-3 text-left text-sm font-semibold text-cyan-300">
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="sticky top-0 bg-slate-800 p-3 text-center text-sm font-semibold text-cyan-300"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, index) => (
              <tr
                key={index}
                className="border-t border-white/10 even:bg-white/5"
              >
                <td className="p-3 text-sm font-medium text-white/80">
                  {slot.time}
                </td>
                {days.map((day) => (
                  <td
                    key={day}
                    className="p-3 text-center text-sm text-white/70"
                  >
                    {slot[day.toLowerCase()] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
