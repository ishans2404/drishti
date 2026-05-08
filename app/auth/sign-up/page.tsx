import Link from "next/link"
import { redirect } from "next/navigation"
import { ClipboardCheck } from "lucide-react"
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
  const params   = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/admin")

  const error = typeof params.error === "string" ? decodeURIComponent(params.error) : null

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f0f4f9" }}>

      <div className="h-1.5 w-full"
        style={{ background: "linear-gradient(90deg, #1a3a6e 0%, #b8861a 100%)" }} />

      <div className="flex items-center gap-4 px-8 py-4 border-b"
        style={{ background: "#0f2347", borderColor: "#1e3a6e" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded font-bold text-base"
          style={{ background: "#b8861a", color: "#fff" }}>
          DR
        </div>
        <div>
          <div className="text-base font-bold text-white tracking-wide">DRISHTI</div>
          <div className="text-xs" style={{ color: "#8aaad0" }}>
            Digital Notice Board Management System
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_420px]">

          {/* Info panel */}
          <div
            className="hidden rounded-lg border p-8 lg:block"
            style={{ background: "#0f2347", borderColor: "#1e3a6e" }}
          >
            <ClipboardCheck className="mb-5 h-10 w-10" style={{ color: "#b8861a" }} />
            <h2 className="text-2xl font-bold leading-snug text-white">
              Create your organization workspace
            </h2>
            <p className="mt-3 text-sm leading-6" style={{ color: "#8aaad0" }}>
              Drishti gives hospitals, schools, and government offices a single
              dashboard to manage digital notice boards across all locations in
              real time.
            </p>
            <div className="mt-8 space-y-3">
              {[
                ["Centralized Control", "Manage all displays from one dashboard"],
                ["Real-time Updates",   "Push content instantly across locations"],
                ["Template Builder",    "Drag-and-drop layout editor"],
                ["Public Kiosk Links",  "Shareable, no-login display URLs"]
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#b8861a" }} />
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs" style={{ color: "#6a8ab0" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <div
              className="rounded-lg border bg-white shadow-md"
              style={{ borderColor: "#d0dae6" }}
            >
              <div className="rounded-t-lg px-6 py-5 border-b"
                style={{ background: "#f8fafc", borderColor: "#d0dae6" }}>
                <div className="text-base font-semibold" style={{ color: "#0d1b2e" }}>
                  Register Administrator Account
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#5a6a7e" }}>
                  Your account, organization, and first display are created together.
                </div>
              </div>

              <div className="px-6 py-6">
                {error && (
                  <div className="mb-4 rounded border px-3 py-2.5 text-sm"
                    style={{ background: "#fef2f2", borderColor: "#fca5a5", color: "#c0392b" }}>
                    {error}
                  </div>
                )}

                <form action={signUpAction} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#5a6a7e" }} htmlFor="full_name">
                      Administrator Name
                    </label>
                    <Input id="full_name" name="full_name" placeholder="Rajesh Kumar" required className="h-9" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#5a6a7e" }} htmlFor="organization_name">
                      Organization / Institution Name
                    </label>
                    <Input id="organization_name" name="organization_name"
                      placeholder="District Hospital, Raipur" required className="h-9" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#5a6a7e" }} htmlFor="email">
                      Official Email Address
                    </label>
                    <Input id="email" name="email" type="email"
                      placeholder="admin@organization.gov.in" required className="h-9" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#5a6a7e" }} htmlFor="password">
                      Password
                    </label>
                    <Input id="password" name="password" type="password"
                      minLength={6} required className="h-9" />
                    <p className="text-[10px]" style={{ color: "#8a9ab0" }}>
                      Minimum 6 characters
                    </p>
                  </div>

                  <Button
                    className="w-full h-9 text-sm font-semibold tracking-wide"
                    type="submit"
                    style={{ background: "#1a3a6e" }}
                  >
                    Create Workspace
                  </Button>
                </form>

                <div className="mt-5 border-t pt-4" style={{ borderColor: "#eaeff5" }}>
                  <p className="text-center text-xs" style={{ color: "#5a6a7e" }}>
                    Already registered?{" "}
                    <Link href="/auth/login"
                      className="font-semibold hover:underline" style={{ color: "#1a3a6e" }}>
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t px-8 py-3 text-center text-xs"
        style={{ background: "#0f2347", borderColor: "#1e3a6e", color: "#6a8ab0" }}>
        Drishti — Digital Signage Management System &nbsp;|&nbsp; Powered by Global Infotech
      </div>
    </main>
  )
}