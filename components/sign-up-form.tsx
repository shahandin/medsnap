"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function SubmitButton({ isFormValid, isLoading }: { isFormValid: boolean; isLoading: boolean }) {
  return (
    <Button
      type="submit"
      disabled={isLoading || !isFormValid}
      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group h-[60px] disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <span className="mr-2 inline-block animate-spin">⏳</span>
          Creating Account...
        </>
      ) : (
        <>
          Create Account
          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
        </>
      )}
    </Button>
  )
}

function SignUpForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasNumber && hasSpecialChar,
    }
  }

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const isFormValid = passwordValidation.isValid && passwordsMatch && email.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/protected`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      setSuccess("Account created successfully! Please check your email to verify your account.")
      // Optionally redirect to a success page
      // router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-border/50">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-heading font-bold text-foreground">Create Account</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">{success}</div>
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
              className="bg-white border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 px-4 focus:border-primary/50 focus:ring-primary/20"
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-border text-foreground pr-12 rounded-xl h-12 px-4 focus:border-primary/50 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="space-y-1 text-xs">
              <div
                className={`flex items-center gap-2 ${passwordValidation.minLength ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.minLength ? "✓" : "✗"}
                At least 8 characters
              </div>
              <div
                className={`flex items-center gap-2 ${passwordValidation.hasNumber ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.hasNumber ? "✓" : "✗"}
                At least one number
              </div>
              <div
                className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.hasSpecialChar ? "✓" : "✗"}
                At least one special character
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white border-border text-foreground pr-12 rounded-xl h-12 px-4 focus:border-primary/50 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                title={showConfirmPassword ? "Hide Password" : "Show Password"}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                {passwordsMatch ? "✓" : "✗"}
                Passwords match
              </div>
            )}
          </div>
        </div>

        <SubmitButton isFormValid={isFormValid} isLoading={isLoading} />

        <div className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </form>
    </div>
  )
}

export { SignUpForm }
export default SignUpForm
