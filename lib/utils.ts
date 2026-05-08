import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not scheduled"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value))
}

export function getInitials(name: string | null | undefined) {
  if (!name) return "DR"
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DR"
}

export function publicUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (baseUrl) return `${baseUrl}${path}`
  return path
}
