"use client"

import type { EmergencyAlert } from "@/lib/types"
import { AlertTriangle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertsModuleProps {
  alerts: EmergencyAlert[]
}

const alertStyles = {
  info: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    icon: Info,
    iconColor: "text-blue-400",
  },
  warning: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    icon: AlertTriangle,
    iconColor: "text-yellow-400",
  },
  critical: {
    bg: "bg-red-500/20",
    border: "border-red-500/50",
    icon: AlertCircle,
    iconColor: "text-red-400",
  },
}

export function AlertsModule({ alerts }: AlertsModuleProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/60">
        <AlertTriangle className="mb-4 h-16 w-16" />
        <p className="text-xl">No active alerts</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        Emergency Alerts
      </h2>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {alerts.map((alert) => {
            const style = alertStyles[alert.alert_type] || alertStyles.warning
            const Icon = style.icon

            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-4 rounded-xl border-2 p-5",
                  style.bg,
                  style.border,
                  alert.alert_type === "critical" && "animate-pulse"
                )}
              >
                <Icon className={cn("h-8 w-8 shrink-0", style.iconColor)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold uppercase",
                        alert.alert_type === "critical" && "bg-red-500 text-white",
                        alert.alert_type === "warning" && "bg-yellow-500 text-black",
                        alert.alert_type === "info" && "bg-blue-500 text-white"
                      )}
                    >
                      {alert.alert_type}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-medium">{alert.message}</p>
                  <p className="mt-2 text-xs text-white/50">
                    Posted {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
