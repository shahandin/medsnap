"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { signIn } from "@/lib/actions"

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group h-[60px]"
    >
      {isLoading ? (
        <>
          <span className="mr-2 inline-block animate-spin">⏳</span>
          Signing in...
        </>
      ) : (
        <>
          Sign In
          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
        </>
      )}
    </Button>
  )
}

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()

      const result = await signIn(email, password)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-border/50">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground">Welcome back</h1>
        <p className="text-base sm:text-lg text-muted-foreground">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 sm:h-12 px-4 focus:border-primary/50 focus:ring-primary/20 text-base"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-border text-foreground pr-12 rounded-xl h-12 sm:h-12 px-4 focus:border-primary/50 focus:ring-primary/20 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 min-w-[44px] justify-center"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        </div>

        <SubmitButton isLoading={isLoading} />

        <div className="text-center text-muted-foreground text-sm sm:text-base">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
