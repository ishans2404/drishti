"use client"

import { useEffect, useState } from "react"
import { createClient, getSupabaseConfig } from "@/lib/supabase/client"
import type { ContentItem, DisplayPayload, MediaAsset } from "@/lib/types"
import { DisplayCanvas } from "@/components/display/display-canvas"

export function PublicDisplay({ initialPayload }: { initialPayload: DisplayPayload }) {
  const [payload, setPayload] = useState(initialPayload)
  const [mediaIndex, setMediaIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setMediaIndex((value) => value + 1), 8000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig()
    if (!supabaseUrl || !supabaseKey) return

    const supabase = createClient()

    async function refresh() {
      const [{ data: contentRows }, { data: mediaRows }, { data: display }] = await Promise.all([
        supabase.from("display_content").select("content_items(*)").eq("display_id", initialPayload.display.id),
        supabase.from("display_media").select("media_assets(*)").eq("display_id", initialPayload.display.id),
        supabase.from("displays").select("*").eq("id", initialPayload.display.id).maybeSingle()
      ])

      setPayload((current) => ({
        ...current,
        display: display ? { ...current.display, ...display } : current.display,
        contentItems: ((contentRows || []).map((row) => row.content_items).filter(Boolean) || []) as unknown as ContentItem[],
        mediaAssets: ((mediaRows || []).map((row) => row.media_assets).filter(Boolean) || []) as unknown as MediaAsset[]
      }))
    }

    const channel = supabase
      .channel(`display-${initialPayload.display.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "displays", filter: `id=eq.${initialPayload.display.id}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "content_items", filter: `organization_id=eq.${initialPayload.organization.id}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "media_assets", filter: `organization_id=eq.${initialPayload.organization.id}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "display_content", filter: `display_id=eq.${initialPayload.display.id}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "display_media", filter: `display_id=eq.${initialPayload.display.id}` }, refresh)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialPayload.display.id, initialPayload.organization.id])

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
      <div className="h-full w-full">
        <DisplayCanvas payload={payload} mediaIndex={mediaIndex} kiosk />
      </div>
    </main>
  )
}
