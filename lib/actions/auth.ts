"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function getRedirectUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  return appUrl ? `${appUrl}/auth/callback` : undefined
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")
  const next = String(formData.get("next") || "/admin")
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect(next.startsWith("/admin") ? next : "/admin")
}

export async function signUpAction(formData: FormData) {
  const fullName = String(formData.get("full_name") || "")
  const organizationName = String(formData.get("organization_name") || "")
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectUrl(),
      data: {
        full_name: fullName,
        organization_name: organizationName
      }
    }
  })

  if (error) {
    redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/auth/login?created=1")
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
