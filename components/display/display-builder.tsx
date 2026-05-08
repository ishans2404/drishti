"use client"

import type { PointerEvent } from "react"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw, Save } from "lucide-react"
import { DisplayCanvas } from "@/components/display/display-canvas"
import { saveDisplayBuilderAction } from "@/lib/actions/displays"
import { createDefaultLayout, getTemplateKeys, templateNames } from "@/lib/templates"
import type { DisplayLayoutConfig, DisplayLayoutZone, DisplayPayload, DisplayThemeConfig, TemplateKey, ZoneType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Field } from "@/components/ui/field"
import { cn } from "@/lib/utils"

type DragState = {
  mode: "move" | "resize"
  zoneId: string
  startX: number
  startY: number
  rect: DOMRect
  original: DisplayLayoutZone
}

const zoneTypes: ZoneType[] = [
  "header",
  "hero-media",
  "notice-rail",
  "event-list",
  "document-list",
  "media-strip",
  "alert-banner",
  "ticker",
  "footer",
  "clock"
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function DisplayBuilder({ initialPayload }: { initialPayload: DisplayPayload }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [payload, setPayload] = useState(initialPayload)
  const [templateKey, setTemplateKey] = useState<TemplateKey>(initialPayload.display.template_key)
  const [layout, setLayout] = useState<DisplayLayoutConfig>(initialPayload.display.layout_config)
  const [theme, setTheme] = useState<DisplayThemeConfig>(initialPayload.display.theme_config)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(layout.zones[0]?.id || null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedZone = useMemo(
    () => layout.zones.find((zone) => zone.id === selectedZoneId) || null,
    [layout.zones, selectedZoneId]
  )

  const builderPayload: DisplayPayload = {
    ...payload,
    display: {
      ...payload.display,
      template_key: templateKey,
      layout_config: layout,
      theme_config: theme
    }
  }

  function updateZone(zoneId: string, updater: (zone: DisplayLayoutZone) => DisplayLayoutZone) {
    setLayout((current) => ({
      ...current,
      zones: current.zones.map((zone) => (zone.id === zoneId ? updater(zone) : zone))
    }))
  }

  function handleZonePointerDown(event: PointerEvent<HTMLDivElement>, zoneId: string) {
    const rect = canvasRef.current?.getBoundingClientRect()
    const zone = layout.zones.find((item) => item.id === zoneId)
    if (!rect || !zone) return
    setSelectedZoneId(zoneId)
    setDragState({
      mode: "move",
      zoneId,
      startX: event.clientX,
      startY: event.clientY,
      rect,
      original: zone
    })
  }

  function handleResizePointerDown(event: PointerEvent<HTMLButtonElement>, zoneId: string) {
    event.preventDefault()
    event.stopPropagation()
    const rect = canvasRef.current?.getBoundingClientRect()
    const zone = layout.zones.find((item) => item.id === zoneId)
    if (!rect || !zone) return
    setSelectedZoneId(zoneId)
    setDragState({
      mode: "resize",
      zoneId,
      startX: event.clientX,
      startY: event.clientY,
      rect,
      original: zone
    })
  }

  useEffect(() => {
    if (!dragState) return
    const state = dragState

    function onPointerMove(event: globalThis.PointerEvent) {
      const dx = ((event.clientX - state.startX) / state.rect.width) * 100
      const dy = ((event.clientY - state.startY) / state.rect.height) * 100
      updateZone(state.zoneId, (zone) => {
        if (state.mode === "move") {
          return {
            ...zone,
            x: Number(clamp(state.original.x + dx, 0, 100 - state.original.w).toFixed(2)),
            y: Number(clamp(state.original.y + dy, 0, 100 - state.original.h).toFixed(2))
          }
        }

        return {
          ...zone,
          w: Number(clamp(state.original.w + dx, 8, 100 - state.original.x).toFixed(2)),
          h: Number(clamp(state.original.h + dy, 6, 100 - state.original.y).toFixed(2))
        }
      })
    }

    function onPointerUp() {
      setDragState(null)
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, [dragState])

  function chooseTemplate(nextTemplate: TemplateKey) {
    setTemplateKey(nextTemplate)
    const nextLayout = createDefaultLayout(nextTemplate)
    setLayout(nextLayout)
    setSelectedZoneId(nextLayout.zones[0]?.id || null)
  }

  function save() {
    setMessage(null)
    startTransition(async () => {
      const result = await saveDisplayBuilderAction(payload.display.id, templateKey, layout, theme)
      setMessage(result.message)
      if (result.ok) {
        setPayload((current) => ({
          ...current,
          display: {
            ...current.display,
            template_key: templateKey,
            layout_config: layout,
            theme_config: theme
          }
        }))
      }
    })
  }

  function addZone() {
    const id = `zone-${crypto.randomUUID().slice(0, 8)}`
    const newZone: DisplayLayoutZone = {
      id,
      type: "notice-rail",
      title: "New Zone",
      x: 8,
      y: 8,
      w: 28,
      h: 22,
      order: layout.zones.length + 1,
      visible: true,
      settings: {
        source: "notice",
        fontScale: 1,
        intervalSeconds: 8,
        maxItems: 3
      }
    }
    setLayout((current) => ({ ...current, zones: [...current.zones, newZone] }))
    setSelectedZoneId(id)
  }

  function removeZone(zoneId: string) {
    setLayout((current) => ({ ...current, zones: current.zones.filter((zone) => zone.id !== zoneId) }))
    setSelectedZoneId(layout.zones.find((zone) => zone.id !== zoneId)?.id || null)
  }

  const backgroundOptions = payload.mediaAssets.filter((asset) => asset.kind === "image" || asset.kind === "background")

  return (
    <div className="grid min-h-[calc(100vh-4rem)] gap-0 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{payload.display.name}</h2>
            <p className="text-sm text-muted-foreground">Drag zones on the 16:9 canvas. Use the handle to resize.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" type="button" onClick={addZone}>Add zone</Button>
            <Button type="button" onClick={save} disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : "Save layout"}
            </Button>
          </div>
        </div>
        {message ? (
          <div className="rounded-md border border-border bg-card px-3 py-2 text-sm">{message}</div>
        ) : null}
        <div ref={canvasRef} className="mx-auto w-full max-w-6xl">
          <DisplayCanvas
            payload={builderPayload}
            editable
            selectedZoneId={selectedZoneId}
            onZonePointerDown={handleZonePointerDown}
            onResizePointerDown={handleResizePointerDown}
          />
        </div>
      </section>

      <aside className="border-t border-border bg-card p-4 xl:border-l xl:border-t-0">
        <div className="space-y-5">
          <Field label="Template" hint="Changing template resets zones to that preset.">
            <NativeSelect value={templateKey} onChange={(event) => chooseTemplate(event.target.value as TemplateKey)}>
              {getTemplateKeys().map((template) => (
                <option key={template} value={template}>{templateNames[template]}</option>
              ))}
            </NativeSelect>
          </Field>

          <div className="space-y-2">
            <div className="text-sm font-medium">Zones</div>
            <div className="max-h-56 space-y-1 overflow-auto pr-1">
              {[...layout.zones].sort((a, b) => a.order - b.order).map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm",
                    selectedZoneId === zone.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  )}
                >
                  <span className="truncate">{zone.title}</span>
                  {zone.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border p-3">
            <div className="font-medium">Display Theme</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary">
                <Input type="color" value={theme.primaryColor} onChange={(event) => setTheme({ ...theme, primaryColor: event.target.value })} />
              </Field>
              <Field label="Accent">
                <Input type="color" value={theme.accentColor} onChange={(event) => setTheme({ ...theme, accentColor: event.target.value })} />
              </Field>
              <Field label="Background">
                <Input type="color" value={theme.backgroundColor} onChange={(event) => setTheme({ ...theme, backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text">
                <Input type="color" value={theme.textColor} onChange={(event) => setTheme({ ...theme, textColor: event.target.value })} />
              </Field>
            </div>
            <Field label="Background media">
              <NativeSelect
                value={theme.backgroundMediaUrl || ""}
                onChange={(event) => setTheme({ ...theme, backgroundMediaUrl: event.target.value || null })}
              >
                <option value="">None</option>
                {backgroundOptions.map((asset) => (
                  <option key={asset.id} value={asset.public_url}>{asset.title}</option>
                ))}
              </NativeSelect>
            </Field>
          </div>

          {selectedZone ? (
            <div className="space-y-4 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">Inspector</div>
                <Button variant="ghost" size="sm" type="button" onClick={() => removeZone(selectedZone.id)}>
                  Remove
                </Button>
              </div>
              <Field label="Title">
                <Input
                  value={selectedZone.title}
                  onChange={(event) => updateZone(selectedZone.id, (zone) => ({ ...zone, title: event.target.value }))}
                />
              </Field>
              <Field label="Module">
                <NativeSelect
                  value={selectedZone.type}
                  onChange={(event) => updateZone(selectedZone.id, (zone) => ({ ...zone, type: event.target.value as ZoneType }))}
                >
                  {zoneTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </NativeSelect>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="X">
                  <Input type="number" value={selectedZone.x} onChange={(event) => updateZone(selectedZone.id, (zone) => ({ ...zone, x: Number(event.target.value) }))} />
                </Field>
                <Field label="Y">
                  <Input type="number" value={selectedZone.y} onChange={(event) => updateZone(selectedZone.id, (zone) => ({ ...zone, y: Number(event.target.value) }))} />
                </Field>
                <Field label="Width">
                  <Input type="number" value={selectedZone.w} onChange={(event) => updateZone(selectedZone.id, (zone) => ({ ...zone, w: Number(event.target.value) }))} />
                </Field>
                <Field label="Height">
                  <Input type="number" value={selectedZone.h} onChange={(event) => updateZone(selectedZone.id, (zone) => ({ ...zone, h: Number(event.target.value) }))} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Font scale">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.6"
                    max="1.8"
                    value={selectedZone.settings.fontScale || 1}
                    onChange={(event) => updateZone(selectedZone.id, (zone) => ({
                      ...zone,
                      settings: { ...zone.settings, fontScale: Number(event.target.value) }
                    }))}
                  />
                </Field>
                <Field label="Max items">
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={selectedZone.settings.maxItems || 3}
                    onChange={(event) => updateZone(selectedZone.id, (zone) => ({
                      ...zone,
                      settings: { ...zone.settings, maxItems: Number(event.target.value) }
                    }))}
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => updateZone(selectedZone.id, (zone) => ({ ...zone, order: zone.order + 1 }))}
                >
                  <ArrowUp className="h-4 w-4" />
                  Forward
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => updateZone(selectedZone.id, (zone) => ({ ...zone, order: Math.max(1, zone.order - 1) }))}
                >
                  <ArrowDown className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => updateZone(selectedZone.id, (zone) => ({ ...zone, visible: !zone.visible }))}
                >
                  {selectedZone.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {selectedZone.visible ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => updateZone(selectedZone.id, (zone) => ({
                    ...zone,
                    x: Math.round(zone.x),
                    y: Math.round(zone.y),
                    w: Math.round(zone.w),
                    h: Math.round(zone.h)
                  }))}
                >
                  <RotateCcw className="h-4 w-4" />
                  Snap
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
