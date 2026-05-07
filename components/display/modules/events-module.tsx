"use client"

import type { Event } from "@/lib/types"
import { Calendar, MapPin } from "lucide-react"

interface EventsModuleProps {
  events: Event[]
}

export function EventsModule({ events }: EventsModuleProps) {
  if (events.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <Calendar className="mb-4 h-16 w-16" />
        <p className="text-xl">No upcoming events</p>
      </div>
    )
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <Calendar className="h-8 w-8 text-green-400" />
        Upcoming Events
      </h2>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {events.slice(0, 5).map((event) => {
            const dateInfo = formatDate(event.start_date)
            return (
              <div
                key={event.id}
                className="flex gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-green-500/20 py-3">
                  <span className="text-2xl font-bold text-green-300">{dateInfo.day}</span>
                  <span className="text-sm uppercase text-green-300">{dateInfo.month}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  {event.description && (
                    <p className="mt-1 text-sm text-white/70 line-clamp-2">{event.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm text-white/60">
                    <span>{dateInfo.time}</span>
                    {event.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.venue}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
