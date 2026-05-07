// Database types for Drishti

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export interface UserOrganization {
  user_id: string
  organization_id: string
  created_at: string
}

export interface Display {
  id: string
  organization_id: string
  name: string
  slug: string
  layout_config: {
    modules: string[]
  }
  is_active: boolean
  created_at: string
}

export interface Notice {
  id: string
  organization_id: string
  title: string
  content: string | null
  category: string
  is_active: boolean
  display_order: number
  created_at: string
  expires_at: string | null
}

export interface Event {
  id: string
  organization_id: string
  title: string
  description: string | null
  venue: string | null
  start_date: string
  end_date: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface Timetable {
  id: string
  organization_id: string
  title: string
  data_json: Record<string, unknown>
  is_active: boolean
  created_at: string
}

export interface GalleryItem {
  id: string
  organization_id: string
  title: string | null
  media_url: string
  media_type: 'image' | 'video'
  is_active: boolean
  display_order: number
  created_at: string
}

export interface Birthday {
  id: string
  organization_id: string
  name: string
  designation: string | null
  date: string
  photo_url: string | null
  is_active: boolean
  created_at: string
}

export interface Achievement {
  id: string
  organization_id: string
  title: string
  description: string | null
  person_name: string | null
  image_url: string | null
  date: string | null
  is_active: boolean
  created_at: string
}

export interface Holiday {
  id: string
  organization_id: string
  name: string
  date: string
  type: string
  is_active: boolean
  created_at: string
}

export interface EmergencyAlert {
  id: string
  organization_id: string
  message: string
  alert_type: 'info' | 'warning' | 'critical'
  is_active: boolean
  created_at: string
  expires_at: string | null
}

export interface CustomContent {
  id: string
  organization_id: string
  title: string
  html_content: string | null
  is_active: boolean
  created_at: string
}

// Module types for display configuration
export type ModuleType = 
  | 'notices'
  | 'events'
  | 'timetable'
  | 'gallery'
  | 'birthdays'
  | 'achievements'
  | 'holidays'
  | 'alerts'
  | 'custom'
