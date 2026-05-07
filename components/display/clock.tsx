"use client"

import { useEffect, useState } from "react"

export function Clock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const timeLabel = time
    ? time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "--:--"

  const dateLabel = time
    ? time.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <div className="text-right">
      <div className="text-3xl font-bold tabular-nums">
        {timeLabel}
      </div>
      <div className="text-sm text-white/60">
        {dateLabel}
      </div>
    </div>
  )
}
