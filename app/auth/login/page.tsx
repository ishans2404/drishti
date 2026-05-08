import Link from "next/link"
import { redirect } from "next/navigation"
import { MonitorPlay } from "lucide-react"
import { signInAction } from "@/lib/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export default async function LoginPage({
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
  const created = params.created
  const next = typeof params.next === "string" ? params.next : "/admin"

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-[#111820] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold">DR</div>
          <div>
            <div className="font-semibold">Drishti</div>
            <div className="text-xs text-white/50">Display command center</div>
          </div>
        </Link>
        <div>
          <MonitorPlay className="mb-6 h-12 w-12 text-[#f6b73c]" />
          <h1 className="max-w-xl text-4xl font-semibold leading-tight">Manage every digital notice board from one place.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
            Sign in to publish notices, assign media, adjust templates, and keep public display links fresh.
          </p>
        </div>
        <div className="text-xs text-white/35">Drishti SaaS platform</div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">DR</div>
            <div className="font-semibold">Drishti</div>
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Use your admin email and password to continue.</p>
          </div>
          {error ? (
            <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          {created ? (
            <div className="mb-4 rounded-md border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              Workspace created. Confirm your email if Supabase requires it, then sign in.
            </div>
          ) : null}
          <form action={signInAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" placeholder="admin@organization.org" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button className="w-full" type="submit">Sign in</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Drishti?{" "}
            <Link className="font-medium text-primary hover:underline" href="/auth/sign-up">
              Create an admin workspace
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
