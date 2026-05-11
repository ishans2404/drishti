import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ContentItem, Display, DisplayPayload, MediaAsset, Organization, Profile } from "@/lib/types"
import { defaultTheme, mergeLayoutWithTemplate } from "@/lib/templates"

export interface AdminContext {
  user: {
    id: string
    email?: string
  }
  profile: Profile | null
  organizations: Organization[]
  currentOrg: Organization | null
}

export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return { supabase, user }
}

export async function getAdminContext(): Promise<AdminContext> {
  const { supabase, user } = await requireUser()
  const cookieStore = await cookies()

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("organization_members")
      .select("organizations(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
  ])

  const organizations = ((memberships || [])
    .map((row) => row.organizations)
    .filter(Boolean) || []) as unknown as Organization[]

  const selectedOrgId = cookieStore.get("drishti_org_id")?.value
  const currentOrg =
    organizations.find((organization) => organization.id === selectedOrgId) ||
    organizations[0] ||
    null

  return {
    user: {
      id: user.id,
      email: user.email
    },
    profile: (profile as Profile | null) || null,
    organizations,
    currentOrg
  }
}

export async function getDisplaysForCurrentOrg() {
  const context = await getAdminContext()
  if (!context.currentOrg) return { context, displays: [] as Display[] }

  const supabase = await createClient()
  const { data } = await supabase
    .from("displays")
    .select("*")
    .eq("organization_id", context.currentOrg.id)
    .order("updated_at", { ascending: false })

  return {
    context,
    displays: ((data || []) as Display[]).map((display) => ({
      ...display,
      layout_config: mergeLayoutWithTemplate(display.layout_config, display.template_key),
      theme_config: { ...defaultTheme, ...(display.theme_config || {}) }
    }))
  }
}

export async function getDisplayPayload(displayId: string): Promise<DisplayPayload | null> {
  const context = await getAdminContext()
  if (!context.currentOrg) return null

  const supabase = await createClient()
  const { data: display } = await supabase
    .from("displays")
    .select("*")
    .eq("id", displayId)
    .eq("organization_id", context.currentOrg.id)
    .maybeSingle()

  if (!display) return null

  const [{ data: contentRows }, { data: mediaRows }] = await Promise.all([
    supabase
      .from("display_content")
      .select("content_items(*)")
      .eq("display_id", displayId),
    supabase
      .from("display_media")
      .select("media_assets(*)")
      .eq("display_id", displayId)
  ])

  return {
    display: {
      ...(display as Display),
      layout_config: mergeLayoutWithTemplate((display as Display).layout_config, (display as Display).template_key),
      theme_config: { ...defaultTheme, ...((display as Display).theme_config || {}) }
    },
    organization: context.currentOrg,
    contentItems: ((contentRows || [])
      .map((row) => row.content_items)
      .filter(Boolean) || []) as unknown as ContentItem[],
    mediaAssets: ((mediaRows || [])
      .map((row) => row.media_assets)
      .filter(Boolean) || []) as unknown as MediaAsset[]
  }
}

export async function getPublicDisplayPayload(slug: string): Promise<DisplayPayload | null> {
  const supabase = await createClient()

  const { data: display } = await supabase
    .from("displays")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!display) return null

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", (display as Display).organization_id)
    .maybeSingle()

  if (!organization) return null

  const [{ data: contentRows }, { data: mediaRows }] = await Promise.all([
    supabase
      .from("display_content")
      .select("content_items(*)")
      .eq("display_id", display.id),
    supabase
      .from("display_media")
      .select("media_assets(*)")
      .eq("display_id", display.id)
  ])

  return {
    display: {
      ...(display as Display),
      layout_config: mergeLayoutWithTemplate((display as Display).layout_config, (display as Display).template_key),
      theme_config: { ...defaultTheme, ...((display as Display).theme_config || {}) }
    },
    organization: organization as Organization,
    contentItems: ((contentRows || [])
      .map((row) => row.content_items)
      .filter(Boolean) || []) as unknown as ContentItem[],
    mediaAssets: ((mediaRows || [])
      .map((row) => row.media_assets)
      .filter(Boolean) || []) as unknown as MediaAsset[]
  }
}
