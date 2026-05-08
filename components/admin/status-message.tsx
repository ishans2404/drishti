import { Badge } from "@/components/ui/badge"

export function StatusMessage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const error = typeof searchParams?.error === "string" ? searchParams.error : null
  const saved = searchParams?.saved || searchParams?.created || searchParams?.uploaded

  if (!error && !saved) return null

  return (
    <div className="px-4 pt-4 sm:px-6">
      {error ? (
        <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decodeURIComponent(error)}
        </div>
      ) : (
        <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          <Badge variant="success" className="mr-2">Saved</Badge>
          Changes are live.
        </div>
      )}
    </div>
  )
}
