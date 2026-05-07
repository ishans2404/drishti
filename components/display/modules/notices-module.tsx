"use client"

import type { Notice } from "@/lib/types"
import { FileText } from "lucide-react"

interface NoticesModuleProps {
  notices: Notice[]
}

export function NoticesModule({ notices }: NoticesModuleProps) {
  if (notices.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <FileText className="mb-4 h-16 w-16" />
        <p className="text-xl">No active notices</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <FileText className="h-8 w-8 text-blue-400" />
        Notice Board
      </h2>
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-2">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-xl bg-white/10 p-5 backdrop-blur-sm"
            >
              <div className="mb-2 flex items-start justify-between">
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium capitalize text-blue-300">
                  {notice.category}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">{notice.title}</h3>
              {notice.content && (
                <p className="text-sm text-white/70 line-clamp-3">{notice.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
