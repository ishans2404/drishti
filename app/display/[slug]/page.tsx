import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { DisplayView } from "@/components/display/display-view"

interface DisplayPageProps {
  params: Promise<{ slug: string }>
}

export default async function DisplayPage({ params }: DisplayPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch display by slug
  const { data: display } = await supabase
    .from("displays")
    .select("*, organizations(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!display) {
    notFound()
  }

  // Fetch all content for this organization
  const orgId = display.organization_id

  const [
    { data: notices },
    { data: events },
    { data: gallery },
    { data: birthdays },
    { data: achievements },
    { data: holidays },
    { data: alerts },
    { data: timetables },
    { data: customContent },
  ] = await Promise.all([
    supabase.from("notices").select("*").eq("organization_id", orgId).eq("is_active", true).order("display_order"),
    supabase.from("events").select("*").eq("organization_id", orgId).eq("is_active", true).order("start_date"),
    supabase.from("gallery").select("*").eq("organization_id", orgId).eq("is_active", true).order("display_order"),
    supabase.from("birthdays").select("*").eq("organization_id", orgId).eq("is_active", true).order("date"),
    supabase.from("achievements").select("*").eq("organization_id", orgId).eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("holidays").select("*").eq("organization_id", orgId).eq("is_active", true).order("date"),
    supabase.from("emergency_alerts").select("*").eq("organization_id", orgId).eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("timetables").select("*").eq("organization_id", orgId).eq("is_active", true).limit(1),
    supabase.from("custom_content").select("*").eq("organization_id", orgId).eq("is_active", true),
  ])

  const initialData = {
    display,
    notices: notices || [],
    events: events || [],
    gallery: gallery || [],
    birthdays: birthdays || [],
    achievements: achievements || [],
    holidays: holidays || [],
    alerts: alerts || [],
    timetables: timetables || [],
    customContent: customContent || [],
  }

  return <DisplayView initialData={initialData} />
}
