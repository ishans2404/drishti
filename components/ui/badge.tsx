import * as React from "react"
import { cn } from "@/lib/utils"

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variant === "default" && "bg-primary/10 text-primary",
        variant === "secondary" && "bg-muted text-muted-foreground",
        variant === "outline" && "border border-border text-foreground",
        variant === "destructive" && "bg-destructive/10 text-destructive",
        variant === "success" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        className
      )}
      {...props}
    />
  )
}
