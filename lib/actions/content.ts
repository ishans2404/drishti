"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAdminContext, requireUser } from "@/lib/server-data"
import type { ContentType } from "@/lib/types"

export async function createContentAction(formData: FormData) {
  const context = await getAdminContext()
  if (!context.currentOrg) redirect("/admin/content?error=no-org")

  const type = String(formData.get("type") || "notice") as ContentType
  const title = String(formData.get("title") || "").trim()
  const body = String(formData.get("body") || "").trim() || null
  const startsAt = String(formData.get("starts_at") || "") || null
  const endsAt = String(formData.get("ends_at") || "") || null
  const displayOrder = Number(formData.get("display_order") || 0)
  const isActive = formData.get("is_active") === "on"
  const displayIds = formData.getAll("display_ids").map(String)
  const metadata = {
    url: String(formData.get("url") || "").trim() || null,
    venue: String(formData.get("venue") || "").trim() || null
  }
  const { supabase } = await requireUser()

  if (!title) redirect("/admin/content?error=missing")

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      organization_id: context.currentOrg.id,
      type,
      title,
      body,
      metadata,
      starts_at: startsAt,
      ends_at: endsAt,
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
      is_active: isActive
    })
    .select("id")
    .single()

  if (error || !data) redirect(`/admin/content?error=${encodeURIComponent(error?.message || "Content could not be created")}`)

  if (displayIds.length) {
    await supabase.from("display_content").insert(
      displayIds.map((displayId) => ({
        display_id: displayId,
        content_item_id: data.id
      }))
    )
  }

  revalidatePath("/admin/content")
  redirect("/admin/content?created=1")
}

export async function toggleContentAction(formData: FormData) {
  const id = String(formData.get("id") || "")
  const isActive = formData.get("is_active") === "true"
  const { supabase } = await requireUser()

  await supabase.from("content_items").update({ is_active: !isActive }).eq("id", id)
  revalidatePath("/admin/content")
}

export async function deleteContentAction(formData: FormData) {
  const id = String(formData.get("id") || "")
  const { supabase } = await requireUser()

  await supabase.from("content_items").delete().eq("id", id)
  revalidatePath("/admin/content")
}

export async function linkContentAction(formData: FormData) {
  const contentItemId = String(formData.get("content_item_id") || "")
  const displayIds = formData.getAll("display_ids").map(String)
  const { supabase } = await requireUser()

  await supabase.from("display_content").delete().eq("content_item_id", contentItemId)
  if (displayIds.length) {
    await supabase.from("display_content").insert(
      displayIds.map((displayId) => ({
        display_id: displayId,
        content_item_id: contentItemId
      }))
    )
  }

  revalidatePath("/admin/content")
}
