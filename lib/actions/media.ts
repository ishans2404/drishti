"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAdminContext, requireUser } from "@/lib/server-data"
import type { MediaKind } from "@/lib/types"
import { slugify } from "@/lib/utils"

function inferKind(file: File, fallback: MediaKind): MediaKind {
  if (file.type.startsWith("image/")) return fallback === "background" ? "background" : "image"
  if (file.type.startsWith("video/")) return "video"
  if (file.type.startsWith("audio/")) return "audio"
  return "document"
}

export async function uploadMediaAction(formData: FormData) {
  const context = await getAdminContext()
  if (!context.currentOrg) redirect("/admin/media?error=no-org")

  const file = formData.get("file")
  const title = String(formData.get("title") || "").trim()
  const fallbackKind = String(formData.get("kind") || "image") as MediaKind
  const displayIds = formData.getAll("display_ids").map(String)

  if (!(file instanceof File) || file.size === 0) redirect("/admin/media?error=file")

  const { supabase } = await requireUser()
  const kind = inferKind(file, fallbackKind)
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin"
  const filename = `${crypto.randomUUID()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${extension}`
  const storagePath = `${context.currentOrg.id}/${filename}`
  const bucket = "display-media"
  const bytes = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  })

  if (uploadError) redirect(`/admin/media?error=${encodeURIComponent(uploadError.message)}`)

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath)
  const { data: media, error } = await supabase
    .from("media_assets")
    .insert({
      organization_id: context.currentOrg.id,
      kind,
      title: title || file.name,
      storage_path: storagePath,
      public_url: publicData.publicUrl,
      mime_type: file.type,
      size_bytes: file.size
    })
    .select("id")
    .single()

  if (error || !media) redirect(`/admin/media?error=${encodeURIComponent(error?.message || "Media could not be saved")}`)

  if (displayIds.length) {
    await supabase.from("display_media").insert(
      displayIds.map((displayId) => ({
        display_id: displayId,
        media_asset_id: media.id
      }))
    )
  }

  revalidatePath("/admin/media")
  redirect("/admin/media?uploaded=1")
}

export async function deleteMediaAction(formData: FormData) {
  const id = String(formData.get("id") || "")
  const storagePath = String(formData.get("storage_path") || "")
  const { supabase } = await requireUser()

  if (storagePath) await supabase.storage.from("display-media").remove([storagePath])
  await supabase.from("media_assets").delete().eq("id", id)
  revalidatePath("/admin/media")
}

export async function linkMediaAction(formData: FormData) {
  const mediaAssetId = String(formData.get("media_asset_id") || "")
  const displayIds = formData.getAll("display_ids").map(String)
  const { supabase } = await requireUser()

  await supabase.from("display_media").delete().eq("media_asset_id", mediaAssetId)
  if (displayIds.length) {
    await supabase.from("display_media").insert(
      displayIds.map((displayId) => ({
        display_id: displayId,
        media_asset_id: mediaAssetId
      }))
    )
  }

  revalidatePath("/admin/media")
}
