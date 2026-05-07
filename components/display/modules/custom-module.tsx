"use client"

import type { CustomContent } from "@/lib/types"
import { Code } from "lucide-react"

interface CustomModuleProps {
  items: CustomContent[]
}

export function CustomModule({ items }: CustomModuleProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <Code className="mb-4 h-16 w-16" />
        <p className="text-xl">No custom content</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <Code className="h-8 w-8 text-indigo-400" />
        Custom Content
      </h2>
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white/10 p-5 backdrop-blur-sm"
            >
              <h3 className="mb-3 text-lg font-semibold">{item.title}</h3>
              {item.html_content && (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.html_content }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
