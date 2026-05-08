import Link from "next/link"
import { redirect } from "next/navigation"
import { ClipboardList } from "lucide-react"
import { signUpAction } from "@/lib/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) redirect("/admin")

  const error = typeof params.error === "string" ? decodeURIComponent(params.error) : null

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">DR</div>
            <div className="font-semibold">Drishti</div>
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Create workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your admin account, organization, and first display are created together.
            </p>
          </div>
          {error ? (
            <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <form action={signUpAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="full_name">Admin name</label>
              <Input id="full_name" name="full_name" placeholder="Ishan Sharma" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="organization_name">Organization</label>
              <Input id="organization_name" name="organization_name" placeholder="City Hospital" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" placeholder="admin@organization.org" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input id="password" name="password" type="password" minLength={6} required />
            </div>
            <Button className="w-full" type="submit">Create Drishti workspace</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-medium text-primary hover:underline" href="/auth/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      <section className="hidden bg-[#122022] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-sm text-white/50">Self-serve onboarding</div>
        <div>
          <ClipboardList className="mb-6 h-12 w-12 text-[#27c5b8]" />
          <h2 className="max-w-lg text-4xl font-semibold leading-tight">Start with templates, then shape each display for its location.</h2>
          <div className="mt-8 grid max-w-lg grid-cols-2 gap-3">
            {["Lobby", "Hospital", "School", "Office"].map((template) => (
              <div key={template} className="rounded-md border border-white/12 bg-white/8 p-4">
                <div className="text-sm font-semibold">{template}</div>
                <div className="mt-2 h-16 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-white/35">Powered by Supabase Auth and PostgreSQL</div>
      </section>
    </main>
  )
}
