"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient, getSupabaseConfig } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [orgName, setOrgName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { supabaseUrl, supabaseKey } = getSupabaseConfig()
    if (!supabaseUrl || !supabaseKey) {
      setError("Supabase is not configured. Check your NEXT_PUBLIC_SUPABASE_URL and key env vars.")
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          org_name: orgName || "My Organization",
        },
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push("/auth/sign-up-success")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white font-bold text-xs">EG</div>
          <span className="text-white font-semibold">EG Drishti</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-slate-400 text-sm mb-8">Set up your organization&apos;s digital notice board</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}
          {[
            { id: "fullName", label: "Full Name", type: "text", placeholder: "Dr. Ramesh Kumar", value: fullName, setter: setFullName, required: true },
            { id: "orgName", label: "Organization Name", type: "text", placeholder: "CGSACS Hospital", value: orgName, setter: setOrgName, required: false },
            { id: "email", label: "Email", type: "email", placeholder: "admin@hospital.org", value: email, setter: setEmail, required: true },
            { id: "password", label: "Password", type: "password", placeholder: "Min. 6 characters", value: password, setter: setPassword, required: true },
          ].map((f) => (
            <div key={f.id} className="flex flex-col gap-1.5">
              <label htmlFor={f.id} className="text-sm text-slate-400">{f.label}</label>
              <input
                id={f.id}
                type={f.type}
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                required={f.required}
                minLength={f.id === "password" ? 6 : undefined}
                className="h-10 rounded-lg border border-slate-700 bg-slate-800/60 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={isLoading}
            className="h-10 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition mt-2"
          >
            {isLoading ? "Creating account…" : "Create Account"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
