"use client"

import type { Achievement } from "@/lib/types"
import { Trophy, Star } from "lucide-react"

interface AchievementsModuleProps {
  achievements: Achievement[]
}

export function AchievementsModule({ achievements }: AchievementsModuleProps) {
  if (achievements.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <Trophy className="mb-4 h-16 w-16" />
        <p className="text-xl">No achievements yet</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <Trophy className="h-8 w-8 text-yellow-400" />
        Achievements
      </h2>
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.slice(0, 6).map((achievement) => (
            <div
              key={achievement.id}
              className="flex gap-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4"
            >
              {achievement.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={achievement.image_url}
                  alt={achievement.title}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-yellow-500/20">
                  <Star className="h-10 w-10 text-yellow-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{achievement.title}</h3>
                {achievement.person_name && (
                  <p className="text-sm text-yellow-300">{achievement.person_name}</p>
                )}
                {achievement.description && (
                  <p className="mt-1 text-sm text-white/70 line-clamp-2">
                    {achievement.description}
                  </p>
                )}
                {achievement.date && (
                  <p className="mt-1 text-xs text-white/50">
                    {new Date(achievement.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
