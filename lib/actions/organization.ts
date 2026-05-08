"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAdminContext, requireUser } from "@/lib/server-data"
import { slugify } from "@/lib/utils"

export async function updateOrganizationAction(formData: FormData) {
  const context = await getAdminContext()
  if (!context.currentOrg) redirect("/admin/organization?error=no-org")

  const name = String(formData.get("name") || "").trim()
  const slug = slugify(String(formData.get("slug") || name))
  const logoUrl = String(formData.get("logo_url") || "").trim() || null
  const primaryColor = String(formData.get("primary_color") || "#2457d6")
  const { supabase } = await requireUser()

  if (!name || !slug) redirect("/admin/organization?error=missing")

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      slug,
      logo_url: logoUrl,
      primary_color: primaryColor
    })
    .eq("id", context.currentOrg.id)

  if (error) redirect(`/admin/organization?error=${encodeURIComponent(error.message)}`)
  revalidatePath("/admin")
  redirect("/admin/organization?saved=1")
}

export async function createOrganizationAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim()
  const slugBase = slugify(String(formData.get("slug") || name))
  const { supabase, user } = await requireUser()

  if (!name || !slugBase) redirect("/admin/organization?error=missing")

  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 6)}`
  const { data: organization, error } = await supabase
    .from("organizations")
    .insert({
      name,
      slug
    })
    .select("*")
    .single()

  if (error || !organization) {
    redirect(`/admin/organization?error=${encodeURIComponent(error?.message || "Organization could not be created")}`)
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: organization.id,
    user_id: user.id
  })

  if (memberError) {
    redirect(`/admin/organization?error=${encodeURIComponent(memberError.message)}`)
  }

  const cookieStore = await cookies()
  cookieStore.set("drishti_org_id", organization.id, {
    sameSite: "lax",
    path: "/"
  })

  revalidatePath("/admin")
  redirect("/admin/organization?created=1")
}
