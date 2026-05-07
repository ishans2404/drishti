"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const templates = [
  {
    id: "custom",
    name: "Customize Feature",
    description: "Flexible layout with modular sections",
    image: "/legacy/01-dashboard.png",
  },
  {
    id: "slider",
    name: "Image Slider",
    description: "Banner-focused layout with rotation",
    image: "/legacy/05-image-slider.png",
  },
  {
    id: "all",
    name: "All Features",
    description: "Everything enabled in one layout",
    image: "/legacy/06-notice-board.png",
  },
]

export default function TemplatePreviewPage() {
  const [activeTemplate, setActiveTemplate] = useState("custom")

  return (
    <div className="flex flex-col">
      <AdminHeader
        title="Template Preview"
        description="Preview and select a display template"
      />

      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const isActive = template.id === activeTemplate
            return (
              <Card
                key={template.id}
                className={cn(
                  "overflow-hidden transition",
                  isActive && "ring-2 ring-primary"
                )}
              >
                <div className="relative aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.image}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                  {isActive && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Active
                    </span>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={isActive ? "secondary" : "default"}
                    className="w-full"
                    onClick={() => setActiveTemplate(template.id)}
                  >
                    {isActive ? "Selected" : "Set Active"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
