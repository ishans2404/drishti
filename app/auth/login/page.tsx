import Link from "next/link"
import { redirect } from "next/navigation"
import { Shield } from "lucide-react"
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
  const params  = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/admin")

  const error   = typeof params.error   === "string" ? decodeURIComponent(params.error) : null
  const created = params.created
  const next    = typeof params.next    === "string" ? params.next : "/admin"

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f0f4f9" }}>

      {/* Top government bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: "linear-gradient(90deg, #1a3a6e 0%, #b8861a 100%)" }}
      />

      {/* Header band */}
      <div
        className="flex items-center gap-4 px-8 py-4 border-b"
        style={{ background: "#0f2347", borderColor: "#1e3a6e" }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded font-bold text-base"
          style={{ background: "#b8861a", color: "#fff" }}
        >
          DR
        </div>
        <div>
          <div className="text-base font-bold text-white tracking-wide">DRISHTI</div>
          <div className="text-xs" style={{ color: "#8aaad0" }}>
            Digital Notice Board Management System
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div
            className="rounded-lg border bg-white shadow-md"
            style={{ borderColor: "#d0dae6" }}
          >
            {/* Card header */}
            <div
              className="flex items-center gap-3 rounded-t-lg px-6 py-5 border-b"
              style={{ background: "#f8fafc", borderColor: "#d0dae6" }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded"
                style={{ background: "#1a3a6e" }}
              >
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-base font-semibold" style={{ color: "#0d1b2e" }}>
                  Administrator Login
                </div>
                <div className="text-xs" style={{ color: "#5a6a7e" }}>
                  Enter your credentials to access the control panel
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className="px-6 py-6">
              {error && (
                <div className="mb-4 rounded border px-3 py-2.5 text-sm"
                  style={{ background: "#fef2f2", borderColor: "#fca5a5", color: "#c0392b" }}>
                  {error}
                </div>
              )}
              {created && (
                <div className="mb-4 rounded border px-3 py-2.5 text-sm"
                  style={{ background: "#f0fdf4", borderColor: "#86efac", color: "#166534" }}>
                  Account created. Please verify your email if required, then sign in.
                </div>
              )}

              <form action={signInAction} className="space-y-4">
                <input type="hidden" name="next" value={next} />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#5a6a7e" }} htmlFor="email">
                    Email Address
                  </label>
                  <Input
                    id="email" name="email" type="email"
                    placeholder="admin@organization.gov.in" required
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#5a6a7e" }} htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password" name="password" type="password"
                    required className="h-9"
                  />
                </div>

                <Button
                  className="w-full h-9 text-sm font-semibold tracking-wide"
                  type="submit"
                  style={{ background: "#1a3a6e" }}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "#eaeff5" }}>
                <p className="text-center text-xs" style={{ color: "#5a6a7e" }}>
                  New administrator?{" "}
                  <Link href="/auth/sign-up"
                    className="font-semibold hover:underline" style={{ color: "#1a3a6e" }}>
                    Create workspace
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-center text-xs" style={{ color: "#8a9ab0" }}>
            Authorized users only. All access is logged.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="border-t px-8 py-3 text-center text-xs"
        style={{ background: "#0f2347", borderColor: "#1e3a6e", color: "#6a8ab0" }}
      >
        Drishti — Digital Signage Management System &nbsp;|&nbsp; Powered by Global Infotech
      </div>
    </main>
  )
}