export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ContentType = "notice" | "event" | "document" | "link" | "alert" | "ticker"
export type MediaKind = "image" | "video" | "audio" | "document" | "background"
export type TemplateKey = "lobby" | "hospital" | "school" | "office" | "minimal"
export type ZoneType =
  | "header"
  | "hero-media"
  | "notice-rail"
  | "event-list"
  | "document-list"
  | "media-strip"
  | "alert-banner"
  | "ticker"
  | "footer"
  | "clock"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  created_at: string
}

export interface Display {
  id: string
  organization_id: string
  name: string
  slug: string
  template_key: TemplateKey
  layout_config: DisplayLayoutConfig
  theme_config: DisplayThemeConfig
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  organization_id: string
  type: ContentType
  title: string
  body: string | null
  metadata: Record<string, Json>
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

export interface MediaAsset {
  id: string
  organization_id: string
  kind: MediaKind
  title: string
  storage_path: string
  public_url: string
  mime_type: string | null
  size_bytes: number | null
  created_at: string
}

export interface DisplayLayoutZone {
  id: string
  type: ZoneType
  title: string
  x: number
  y: number
  w: number
  h: number
  order: number
  visible: boolean
  settings: {
    color?: string
    background?: string
    fontScale?: number
    intervalSeconds?: number
    source?: ContentType | MediaKind | "organization"
    align?: "left" | "center" | "right"
    density?: "comfortable" | "compact"
    maxItems?: number
  }
}

export interface DisplayLayoutConfig {
  version: 1
  zones: DisplayLayoutZone[]
}

export interface DisplayThemeConfig {
  primaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  radius: number
  backgroundMediaUrl?: string | null
}

export interface DisplayPayload {
  display: Display
  organization: Organization
  contentItems: ContentItem[]
  mediaAssets: MediaAsset[]
}
