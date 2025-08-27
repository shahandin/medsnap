"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton({ isFormValid }: { isFormValid: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || !isFormValid}
      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group h-[60px] disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <span className="mr-2 inline-block animate-spin">⏳</span>
          Creating account...
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
  const [state, setState] = useState<{ error?: string; success?: string } | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
  const isFormValid = passwordValidation.isValid && passwordsMatch

  const handleSubmit = async (formData: FormData) => {
    setState(null)
    try {
      const result = await signUp(null, formData)
      setState(result)
    } catch (error) {
      setState({ error: "An error occurred during sign up" })
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-border/50">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-heading font-bold text-foreground">Create your account</h1>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{state.error}</div>
        )}

        {state?.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">{state.success}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
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
                name="password"
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
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="space-y-1 text-xs">
              <div
                className={`flex items-center gap-2 ${passwordValidation.minLength ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.minLength ? "✓" : "✗"}
                At least 8 characters long
              </div>
              <div
                className={`flex items-center gap-2 ${passwordValidation.hasNumber ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.hasNumber ? "✓" : "✗"}
                Contains at least one number
              </div>
              <div
                className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.hasSpecialChar ? "✓" : "✗"}
                Contains at least one special character (!@#$%^&*(),.?":{}|{`<>`})
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
                name="confirmPassword"
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

        <SubmitButton isFormValid={isFormValid} />

        <div className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors duration-200">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

export { SignUpForm }
export default SignUpForm
