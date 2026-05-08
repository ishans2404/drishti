import type { DisplayLayoutConfig, DisplayLayoutZone, DisplayThemeConfig, TemplateKey, ZoneType } from "@/lib/types"

export const templateNames: Record<TemplateKey, string> = {
  lobby: "Lobby",
  hospital: "Hospital",
  school: "School",
  office: "Office",
  minimal: "Minimal"
}

export const templateDescriptions: Record<TemplateKey, string> = {
  lobby: "Balanced hero media, notices, events, and ticker for reception screens.",
  hospital: "High-contrast alerts, patient-facing notices, documents, and quick updates.",
  school: "Announcements, event timeline, media moments, and daily schedule feel.",
  office: "Operational updates, links, documents, and leadership messages.",
  minimal: "A clean single-view board with a large visual area and concise ticker."
}

export const defaultTheme: DisplayThemeConfig = {
  primaryColor: "#2457d6",
  backgroundColor: "#101820",
  textColor: "#f8fbff",
  accentColor: "#f6b73c",
  radius: 8,
  backgroundMediaUrl: null
}

function zone(
  id: string,
  type: ZoneType,
  title: string,
  x: number,
  y: number,
  w: number,
  h: number,
  order: number,
  settings: DisplayLayoutZone["settings"] = {}
): DisplayLayoutZone {
  return {
    id,
    type,
    title,
    x,
    y,
    w,
    h,
    order,
    visible: true,
    settings: {
      fontScale: 1,
      intervalSeconds: 8,
      density: "comfortable",
      ...settings
    }
  }
}

export function createDefaultLayout(template: TemplateKey): DisplayLayoutConfig {
  const layouts: Record<TemplateKey, DisplayLayoutZone[]> = {
    lobby: [
      zone("header", "header", "Organization Header", 3, 3, 94, 10, 1, { source: "organization" }),
      zone("hero", "hero-media", "Feature Visual", 3, 16, 58, 58, 2, { source: "image", intervalSeconds: 10 }),
      zone("notices", "notice-rail", "Notice Board", 63, 16, 34, 35, 3, { source: "notice", maxItems: 4 }),
      zone("events", "event-list", "Events", 63, 53, 34, 21, 4, { source: "event", maxItems: 3 }),
      zone("ticker", "ticker", "Ticker", 3, 77, 94, 8, 5, { source: "ticker" }),
      zone("footer", "footer", "Footer", 3, 87, 94, 8, 6)
    ],
    hospital: [
      zone("alert", "alert-banner", "Emergency Alert", 2, 3, 96, 9, 1, { source: "alert" }),
      zone("header", "header", "Hospital Header", 2, 14, 96, 10, 2, { source: "organization" }),
      zone("notices", "notice-rail", "Patient Notices", 2, 27, 32, 48, 3, { source: "notice", maxItems: 5, density: "compact" }),
      zone("hero", "hero-media", "Health Awareness", 36, 27, 62, 48, 4, { source: "image", intervalSeconds: 12 }),
      zone("docs", "document-list", "Documents", 2, 78, 32, 14, 5, { source: "document", maxItems: 3 }),
      zone("ticker", "ticker", "Live Updates", 36, 78, 62, 14, 6, { source: "ticker" })
    ],
    school: [
      zone("header", "header", "School Header", 3, 3, 94, 11, 1, { source: "organization", align: "center" }),
      zone("events", "event-list", "Today and Upcoming", 3, 17, 30, 56, 2, { source: "event", maxItems: 5 }),
      zone("hero", "hero-media", "Campus Media", 35, 17, 62, 42, 3, { source: "image", intervalSeconds: 9 }),
      zone("media", "media-strip", "Gallery Strip", 35, 61, 62, 12, 4, { source: "image" }),
      zone("ticker", "ticker", "Announcements", 3, 77, 94, 8, 5, { source: "ticker" }),
      zone("clock", "clock", "Date and Time", 3, 87, 22, 8, 6),
      zone("footer", "footer", "Footer", 27, 87, 70, 8, 7)
    ],
    office: [
      zone("header", "header", "Office Header", 3, 4, 94, 11, 1, { source: "organization" }),
      zone("notices", "notice-rail", "Operations Board", 3, 18, 36, 45, 2, { source: "notice", maxItems: 4 }),
      zone("docs", "document-list", "Quick Links", 3, 66, 36, 18, 3, { source: "link", maxItems: 4 }),
      zone("hero", "hero-media", "Leadership Message", 42, 18, 55, 48, 4, { source: "image" }),
      zone("events", "event-list", "Calendar", 42, 69, 35, 15, 5, { source: "event", maxItems: 2 }),
      zone("clock", "clock", "Clock", 79, 69, 18, 15, 6),
      zone("ticker", "ticker", "Ticker", 3, 88, 94, 7, 7, { source: "ticker" })
    ],
    minimal: [
      zone("header", "header", "Header", 4, 4, 92, 10, 1, { source: "organization", align: "center" }),
      zone("hero", "hero-media", "Main Canvas", 4, 17, 92, 55, 2, { source: "image", intervalSeconds: 12 }),
      zone("notices", "notice-rail", "Key Notices", 4, 75, 62, 15, 3, { source: "notice", maxItems: 3, density: "compact" }),
      zone("clock", "clock", "Clock", 69, 75, 27, 15, 4)
    ]
  }

  return {
    version: 1,
    zones: layouts[template]
  }
}

export function mergeLayoutWithTemplate(layout: unknown, template: TemplateKey): DisplayLayoutConfig {
  if (
    layout &&
    typeof layout === "object" &&
    "zones" in layout &&
    Array.isArray((layout as DisplayLayoutConfig).zones)
  ) {
    return layout as DisplayLayoutConfig
  }

  return createDefaultLayout(template)
}

export function getTemplateKeys(): TemplateKey[] {
  return ["lobby", "hospital", "school", "office", "minimal"]
}
