import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  actions
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div
      className="flex flex-col gap-3 border-b bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      style={{ borderColor: "#d0dae6" }}
    >
      <div>
        <h1 className="text-lg font-bold tracking-tight" style={{ color: "#0d1b2e" }}>
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 text-xs" style={{ color: "#5a6a7e" }}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}