import { notFound } from "next/navigation"
import { PublicDisplay } from "@/components/display/public-display"
import { getPublicDisplayPayload } from "@/lib/server-data"

export const dynamic = "force-dynamic"

export default async function DisplayPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPublicDisplayPayload(slug)

  if (!payload) notFound()

  return <PublicDisplay initialPayload={payload} />
}
