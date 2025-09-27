"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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
          Signing In...
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
    console.log("[v0] Form submission started")

    try {
      e.preventDefault()
      console.log("[v0] Default prevented, starting authentication process")

      setIsLoading(true)
      setError(null)

      console.log("[v0] Login attempt starting for email:", email)
      console.log("[v0] Form data:", { email: !!email, password: !!password })

      if (!email || !password) {
        console.log("[v0] Missing email or password")
        setError("Please enter both email and password")
        setIsLoading(false)
        return
      }

      const supabase = createClient()
      console.log("[v0] Supabase client created")

      // Clear any existing session
      await supabase.auth.signOut()
      console.log("[v0] Previous session cleared")

      console.log("[v0] Attempting signInWithPassword...")
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      console.log("[v0] Sign-in response received:", {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        errorMessage: signInError?.message,
      })

      if (signInError) {
        console.log("[v0] Sign-in error details:", signInError)
        setError(signInError.message)
        return
      }

      if (!data.user || !data.session) {
        console.log("[v0] No user or session in response")
        setError("Authentication failed - no user session created")
        return
      }

      console.log("[v0] Sign-in successful, user ID:", data.user.id)
      console.log("[v0] Redirecting to dashboard...")

      // Use window.location for more reliable redirect
      window.location.href = "/dashboard"
    } catch (error: unknown) {
      console.log("[v0] Unexpected error during sign-in:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
      console.log("[v0] Form submission completed")
    }
  }

  const handleFormClick = () => {
    console.log("[v0] Form clicked")
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log("[v0] Submit button clicked")
    // Don't prevent default here, let the form handle it
  }

  return (
    <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-border/50">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground">Welcome Back</h1>
        <p className="text-base sm:text-lg text-muted-foreground">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} onClick={handleFormClick} className="space-y-5 sm:space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
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
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        </div>

        <div onClick={handleButtonClick}>
          <SubmitButton isLoading={isLoading} />
        </div>

        <div className="text-center text-muted-foreground text-sm sm:text-base">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 underline bg-transparent border-none cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
