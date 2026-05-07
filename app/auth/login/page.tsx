"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient, getSupabaseConfig } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push("/admin")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 to-slate-800 border-r border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-sm">
            EG
          </div>
          <span className="text-white font-semibold text-lg">EG Drishti</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Smart Vision<br />Admin Portal
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Centralized digital notice board management for hospitals, schools, and offices. Push real-time updates to all your screens from one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: "Real-time Updates", desc: "Instant push to all screens" },
              { label: "Multi-location", desc: "Manage hundreds of displays" },
              { label: "Rich Media", desc: "Images, video, audio & text" },
              { label: "Secure Access", desc: "Role-based admin control" },
            ].map((f) => (
              <div key={f.label} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                <p className="text-white text-sm font-medium">{f.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-600 text-sm">Powered by Global Infotech, Durg</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white font-bold text-xs">EG</div>
            <span className="text-white font-semibold">EG Drishti</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-slate-400 text-sm mb-8">Enter your credentials to access the admin panel</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm text-slate-400">Email / Username</label>
              <input
                id="email"
                type="email"
                placeholder="admin@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 rounded-lg border border-slate-700 bg-slate-800/60 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm text-slate-400">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 rounded-lg border border-slate-700 bg-slate-800/60 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition mt-2"
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="text-blue-400 hover:text-blue-300">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
