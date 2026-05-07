"use client"

import { useEffect, useState } from "react"
import type { GalleryItem } from "@/lib/types"
import { Image, ChevronLeft, ChevronRight, Music, Video } from "lucide-react"

interface GalleryModuleProps {
  items: GalleryItem[]
}

export function GalleryModule({ items }: GalleryModuleProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance gallery every 5 seconds
  useEffect(() => {
    if (items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [items.length])

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <Image className="mb-4 h-16 w-16" />
        <p className="text-xl">No gallery items</p>
      </div>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <Image className="h-8 w-8 text-purple-400" />
        Photo Gallery
      </h2>
      <div className="relative flex-1 overflow-hidden rounded-xl">
        {currentItem.media_type === "video" ? (
          <div className="flex h-full items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-2 text-white/60">
              <Video className="h-10 w-10" />
              <p>Video content</p>
            </div>
          </div>
        ) : currentItem.media_type === "audio" ? (
          <div className="flex h-full items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-2 text-white/70">
              <Music className="h-10 w-10" />
              <p>{currentItem.title || "Audio content"}</p>
            </div>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentItem.media_url}
            alt={currentItem.title || "Gallery image"}
            className="h-full w-full object-contain"
          />
        )}
        
        {items.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Title overlay */}
        {currentItem.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-lg font-medium">{currentItem.title}</p>
          </div>
        )}

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
