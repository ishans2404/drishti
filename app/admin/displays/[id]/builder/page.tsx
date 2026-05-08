import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { DisplayBuilder } from "@/components/display/display-builder"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { getDisplayPayload } from "@/lib/server-data"

export const dynamic = "force-dynamic"

export default async function BuilderPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payload = await getDisplayPayload(id)

  if (!payload) notFound()

  return (
    <>
      <PageHeader
        title="Builder"
        description="Arrange a single-screen display using template zones, reusable content, and media."
        actions={
          <Button asChild variant="outline">
            <Link href={`/display/${payload.display.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Public view
            </Link>
          </Button>
        }
      />
      <DisplayBuilder initialPayload={payload} />
    </>
  )
}
