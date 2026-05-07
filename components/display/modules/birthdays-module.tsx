"use client"

import type { Birthday } from "@/lib/types"
import { Cake, User } from "lucide-react"

interface BirthdaysModuleProps {
  birthdays: Birthday[]
}

export function BirthdaysModule({ birthdays }: BirthdaysModuleProps) {
  // Filter to show birthdays within the current month
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentDay = today.getDate()

  const relevantBirthdays = birthdays.filter((b) => {
    const bDate = new Date(b.date + "T00:00:00")
    return bDate.getMonth() === currentMonth
  }).sort((a, b) => {
    const dayA = new Date(a.date + "T00:00:00").getDate()
    const dayB = new Date(b.date + "T00:00:00").getDate()
    return dayA - dayB
  })

  const todayBirthdays = relevantBirthdays.filter((b) => {
    return new Date(b.date + "T00:00:00").getDate() === currentDay
  })

  const upcomingBirthdays = relevantBirthdays.filter((b) => {
    return new Date(b.date + "T00:00:00").getDate() > currentDay
  })

  if (birthdays.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <Cake className="mb-4 h-16 w-16" />
        <p className="text-xl">No birthdays this month</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <Cake className="h-8 w-8 text-pink-400" />
        Birthdays
      </h2>
      <div className="flex-1 overflow-y-auto">
        {/* Today's Birthdays */}
        {todayBirthdays.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-pink-300">
              Today&apos;s Celebrations
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {todayBirthdays.map((birthday) => (
                <div
                  key={birthday.id}
                  className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 ring-2 ring-pink-500/30"
                >
                  {birthday.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={birthday.photo_url}
                      alt={birthday.name}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-pink-400"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/30">
                      <User className="h-8 w-8 text-pink-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{birthday.name}</p>
                    {birthday.designation && (
                      <p className="text-sm text-white/60">{birthday.designation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Birthdays */}
        {upcomingBirthdays.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white/80">
              Upcoming
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingBirthdays.slice(0, 8).map((birthday) => (
                <div
                  key={birthday.id}
                  className="flex items-center gap-3 rounded-lg bg-white/10 p-3"
                >
                  {birthday.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={birthday.photo_url}
                      alt={birthday.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                      <User className="h-5 w-5 text-pink-300" />
                    </div>
                  )}
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium">{birthday.name}</p>
                    <p className="text-xs text-white/60">
                      {new Date(birthday.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
