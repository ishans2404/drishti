import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Field({
  label,
  hint,
  children,
  className
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <div className="text-sm font-medium">{label}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </div>
      {children}
    </div>
  )
}
