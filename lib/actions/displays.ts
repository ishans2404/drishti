"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAdminContext, requireUser } from "@/lib/server-data"
import type { DisplayLayoutConfig, DisplayThemeConfig, TemplateKey } from "@/lib/types"
import { createDefaultLayout, defaultTheme } from "@/lib/templates"
import { slugify } from "@/lib/utils"

export async function createDisplayAction(formData: FormData) {
  const context = await getAdminContext()
  if (!context.currentOrg) redirect("/admin/displays?error=no-org")

  const name = String(formData.get("name") || "").trim()
  const slugBase = slugify(String(formData.get("slug") || name))
  const templateKey = String(formData.get("template_key") || "lobby") as TemplateKey
  const isActive = formData.get("is_active") === "on"
  const { supabase } = await requireUser()

  if (!name || !slugBase) redirect("/admin/displays?error=missing")

  const { data, error } = await supabase
    .from("displays")
    .insert({
      organization_id: context.currentOrg.id,
      name,
      slug: slugBase,
      template_key: templateKey,
      layout_config: createDefaultLayout(templateKey),
      theme_config: {
        ...defaultTheme,
        primaryColor: context.currentOrg.primary_color || defaultTheme.primaryColor
      },
      is_active: isActive
    })
    .select("id")
    .single()

  if (error || !data) redirect(`/admin/displays?error=${encodeURIComponent(error?.message || "Display could not be created")}`)

  revalidatePath("/admin/displays")
  redirect(`/admin/displays/${data.id}/builder`)
}

export async function updateDisplayBasicsAction(formData: FormData) {
  const id = String(formData.get("id") || "")
  const name = String(formData.get("name") || "").trim()
  const slug = slugify(String(formData.get("slug") || name))
  const templateKey = String(formData.get("template_key") || "lobby") as TemplateKey
  const isActive = formData.get("is_active") === "on"
  const { supabase } = await requireUser()

  if (!id || !name || !slug) redirect("/admin/displays?error=missing")

  const { error } = await supabase
    .from("displays")
    .update({
      name,
      slug,
      template_key: templateKey,
      is_active: isActive
    })
    .eq("id", id)

  if (error) redirect(`/admin/displays?error=${encodeURIComponent(error.message)}`)
  revalidatePath("/admin/displays")
  redirect("/admin/displays?saved=1")
}

export async function toggleDisplayAction(formData: FormData) {
  const id = String(formData.get("id") || "")
  const isActive = formData.get("is_active") === "true"
  const { supabase } = await requireUser()

  await supabase.from("displays").update({ is_active: !isActive }).eq("id", id)
  revalidatePath("/admin/displays")
}

export async function deleteDisplayAction(formData: FormData) {
  const id = String(formData.get("id") || "")
  const { supabase } = await requireUser()

  await supabase.from("displays").delete().eq("id", id)
  revalidatePath("/admin/displays")
}

export async function saveDisplayBuilderAction(
  displayId: string,
  templateKey: TemplateKey,
  layoutConfig: DisplayLayoutConfig,
  themeConfig: DisplayThemeConfig
) {
  const { supabase } = await requireUser()
  const { error } = await supabase
    .from("displays")
    .update({
      template_key: templateKey,
      layout_config: layoutConfig,
      theme_config: themeConfig
    })
    .eq("id", displayId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath(`/admin/displays/${displayId}/builder`)
  revalidatePath("/display/[slug]", "page")
  return { ok: true, message: "Display saved" }
}
