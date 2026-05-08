"use client"

import type { PointerEvent } from "react"
import { CalendarDays, Clock3, FileText, ImageIcon, Link as LinkIcon, Megaphone, ShieldAlert } from "lucide-react"
import type { ContentItem, Display, DisplayLayoutZone, DisplayPayload, MediaAsset, Organization } from "@/lib/types"
import { cn, formatDate, getInitials } from "@/lib/utils"

function activeContent(items: ContentItem[]) {
  const now = Date.now()
  return items
    .filter((item) => {
      if (!item.is_active) return false
      if (item.starts_at && new Date(item.starts_at).getTime() > now) return false
      if (item.ends_at && new Date(item.ends_at).getTime() < now) return false
      return true
    })
    .sort((a, b) => a.display_order - b.display_order || a.title.localeCompare(b.title))
}

function byType(items: ContentItem[], type: ContentItem["type"]) {
  return activeContent(items).filter((item) => item.type === type)
}

function byKind(items: MediaAsset[], kinds: MediaAsset["kind"][]) {
  return items.filter((item) => kinds.includes(item.kind))
}

function ZoneShell({
  zone,
  children,
  selected,
  editable,
  onPointerDown,
  onResizePointerDown
}: {
  zone: DisplayLayoutZone
  children: React.ReactNode
  selected?: boolean
  editable?: boolean
  onPointerDown?: (event: PointerEvent<HTMLDivElement>, zoneId: string) => void
  onResizePointerDown?: (event: PointerEvent<HTMLButtonElement>, zoneId: string) => void
}) {
  return (
    <div
      className={cn(
        "absolute overflow-hidden rounded-md border border-white/10 bg-white/[0.08] shadow-sm",
        editable && "cursor-move ring-1 ring-white/10 hover:ring-white/30",
        selected && "ring-2 ring-[#f6b73c]"
      )}
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.w}%`,
        height: `${zone.h}%`,
        zIndex: zone.order
      }}
      onPointerDown={(event) => onPointerDown?.(event, zone.id)}
    >
      {children}
      {editable ? (
        <>
          <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
            {zone.title}
          </div>
          <button
            aria-label={`Resize ${zone.title}`}
            className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize rounded-sm border border-white/40 bg-white/80"
            onPointerDown={(event) => onResizePointerDown?.(event, zone.id)}
          />
        </>
      ) : null}
    </div>
  )
}

function HeaderZone({
  organization,
  display,
  zone
}: {
  organization: Organization
  display: Display
  zone: DisplayLayoutZone
}) {
  const align = zone.settings.align || "left"
  return (
    <div
      className={cn(
        "flex h-full items-center gap-3 px-4",
        align === "center" && "justify-center text-center",
        align === "right" && "justify-end text-right"
      )}
      style={{ fontSize: `${Math.max(zone.settings.fontScale || 1, 0.75)}em` }}
    >
      {organization.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={organization.logo_url} alt="" className="h-10 w-10 rounded-md object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-sm font-bold text-[#172033]">
          {getInitials(organization.name)}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-lg font-semibold leading-tight">{organization.name}</div>
        <div className="truncate text-xs text-white/55">{display.name}</div>
      </div>
    </div>
  )
}

function HeroZone({
  media,
  index,
  theme
}: {
  media: MediaAsset[]
  index: number
  theme: Display["theme_config"]
}) {
  const item = media[index % Math.max(media.length, 1)]
  if (!item) {
    return (
      <div className="flex h-full items-end bg-[linear-gradient(135deg,#2457d6,#159b8f)] p-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/65">
            <ImageIcon className="h-4 w-4" />
            Visual canvas
          </div>
          <div className="max-w-md text-3xl font-semibold leading-tight" style={{ color: theme.textColor }}>
            Add images or videos from the media library.
          </div>
        </div>
      </div>
    )
  }

  if (item.kind === "video") {
    return (
      <video className="h-full w-full object-cover" src={item.public_url} autoPlay muted loop playsInline />
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.public_url} alt={item.title} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="text-lg font-semibold text-white">{item.title}</div>
      </div>
    </div>
  )
}

function NoticeZone({
  items,
  zone
}: {
  items: ContentItem[]
  zone: DisplayLayoutZone
}) {
  const maxItems = zone.settings.maxItems || 4
  const visible = items.slice(0, maxItems)
  return (
    <div className="flex h-full flex-col p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <Megaphone className="h-4 w-4 text-[#f6b73c]" />
        {zone.title}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
        {visible.length ? visible.map((item) => (
          <div key={item.id} className="rounded-md bg-white/12 p-2">
            <div className="line-clamp-2 text-sm font-semibold text-white">{item.title}</div>
            {item.body ? <div className="mt-1 line-clamp-2 text-xs text-white/62">{item.body}</div> : null}
          </div>
        )) : (
          <div className="flex h-full items-center justify-center rounded-md border border-dashed border-white/20 text-center text-xs text-white/45">
            No notices assigned
          </div>
        )}
      </div>
    </div>
  )
}

function EventZone({
  items,
  zone
}: {
  items: ContentItem[]
  zone: DisplayLayoutZone
}) {
  const visible = items.slice(0, zone.settings.maxItems || 3)
  return (
    <div className="flex h-full flex-col p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <CalendarDays className="h-4 w-4 text-[#27c5b8]" />
        {zone.title}
      </div>
      <div className="space-y-2 overflow-hidden">
        {visible.length ? visible.map((item) => (
          <div key={item.id} className="grid grid-cols-[auto_1fr] gap-2 rounded-md bg-white/10 p-2 text-xs">
            <div className="rounded bg-white/15 px-2 py-1 text-white/80">{formatDate(item.starts_at)}</div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">{item.title}</div>
              {item.body ? <div className="truncate text-white/55">{item.body}</div> : null}
            </div>
          </div>
        )) : (
          <div className="rounded-md border border-dashed border-white/20 p-3 text-xs text-white/45">No events assigned</div>
        )}
      </div>
    </div>
  )
}

function DocumentZone({
  items,
  zone
}: {
  items: ContentItem[]
  zone: DisplayLayoutZone
}) {
  const visible = items.slice(0, zone.settings.maxItems || 4)
  return (
    <div className="flex h-full flex-col p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <FileText className="h-4 w-4 text-[#9bb6ff]" />
        {zone.title}
      </div>
      <div className="space-y-2 overflow-hidden">
        {visible.length ? visible.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-md bg-white/10 p-2 text-xs text-white">
            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-[#f6b73c]" />
            <span className="truncate">{item.title}</span>
          </div>
        )) : (
          <div className="rounded-md border border-dashed border-white/20 p-3 text-xs text-white/45">No documents or links</div>
        )}
      </div>
    </div>
  )
}

function MediaStrip({ media }: { media: MediaAsset[] }) {
  return (
    <div className="grid h-full grid-cols-4 gap-2 p-2">
      {media.slice(0, 4).map((item) => (
        <div key={item.id} className="overflow-hidden rounded-md bg-white/10">
          {item.kind === "image" || item.kind === "background" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.public_url} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/55">{item.kind}</div>
          )}
        </div>
      ))}
    </div>
  )
}

function TickerZone({ items }: { items: ContentItem[] }) {
  const text = items.length
    ? items.map((item) => `${item.title}${item.body ? `: ${item.body}` : ""}`).join("   •   ")
    : "Add ticker content from the content library"

  return (
    <div className="flex h-full items-center overflow-hidden bg-[#f6b73c] text-[#172033]">
      <div className="kiosk-ticker whitespace-nowrap px-4 text-sm font-semibold">{text}</div>
    </div>
  )
}

function AlertZone({ items }: { items: ContentItem[] }) {
  const alert = items[0]
  return (
    <div className="flex h-full items-center justify-center gap-3 bg-[#d92d20] px-4 text-center text-sm font-semibold text-white">
      <ShieldAlert className="h-5 w-5 shrink-0" />
      {alert ? `${alert.title}${alert.body ? `: ${alert.body}` : ""}` : "Emergency alert area"}
    </div>
  )
}

function ClockZone() {
  const now = new Date()
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-white">
      <Clock3 className="mb-1 h-5 w-5 text-[#f6b73c]" />
      <div className="text-xl font-semibold">
        {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-xs text-white/55">{now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
    </div>
  )
}

function FooterZone({ organization }: { organization: Organization }) {
  return (
    <div className="flex h-full items-center justify-between px-4 text-xs text-white/65">
      <span>{organization.name}</span>
      <span>Powered by Drishti</span>
    </div>
  )
}

function renderZone(
  zone: DisplayLayoutZone,
  payload: DisplayPayload,
  mediaIndex: number
) {
  const { display, organization, contentItems, mediaAssets } = payload
  const notices = byType(contentItems, "notice")
  const events = byType(contentItems, "event")
  const docs = [...byType(contentItems, "document"), ...byType(contentItems, "link")]
  const alerts = byType(contentItems, "alert")
  const ticker = byType(contentItems, "ticker")
  const visualMedia = byKind(mediaAssets, ["image", "background", "video"])

  switch (zone.type) {
    case "header":
      return <HeaderZone organization={organization} display={display} zone={zone} />
    case "hero-media":
      return <HeroZone media={visualMedia} index={mediaIndex} theme={display.theme_config} />
    case "notice-rail":
      return <NoticeZone items={notices} zone={zone} />
    case "event-list":
      return <EventZone items={events} zone={zone} />
    case "document-list":
      return <DocumentZone items={docs} zone={zone} />
    case "media-strip":
      return <MediaStrip media={visualMedia} />
    case "alert-banner":
      return <AlertZone items={alerts} />
    case "ticker":
      return <TickerZone items={ticker} />
    case "clock":
      return <ClockZone />
    case "footer":
    default:
      return <FooterZone organization={organization} />
  }
}

export function DisplayCanvas({
  payload,
  mediaIndex = 0,
  editable = false,
  kiosk = false,
  selectedZoneId,
  onZonePointerDown,
  onResizePointerDown
}: {
  payload: DisplayPayload
  mediaIndex?: number
  editable?: boolean
  kiosk?: boolean
  selectedZoneId?: string | null
  onZonePointerDown?: (event: PointerEvent<HTMLDivElement>, zoneId: string) => void
  onResizePointerDown?: (event: PointerEvent<HTMLButtonElement>, zoneId: string) => void
}) {
  const { display } = payload
  const zones = [...display.layout_config.zones]
    .filter((zone) => zone.visible)
    .sort((a, b) => a.order - b.order)
  const theme = display.theme_config
  const backgroundImage = theme.backgroundMediaUrl ? `url(${theme.backgroundMediaUrl})` : undefined

  return (
    <div
      className={cn(
        "relative overflow-hidden text-white shadow-2xl",
        kiosk ? "h-full w-full rounded-none" : "aspect-video w-full rounded-lg",
        editable && "canvas-grid"
      )}
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: kiosk ? 0 : theme.radius
      }}
    >
      {theme.backgroundMediaUrl ? <div className="absolute inset-0 bg-black/45" /> : null}
      {zones.length ? zones.map((zone) => (
        <ZoneShell
          key={zone.id}
          zone={zone}
          editable={editable}
          selected={selectedZoneId === zone.id}
          onPointerDown={onZonePointerDown}
          onResizePointerDown={onResizePointerDown}
        >
          {renderZone(zone, payload, mediaIndex)}
        </ZoneShell>
      )) : (
        <div className="flex h-full items-center justify-center text-white/55">No layout zones configured.</div>
      )}
    </div>
  )
}
