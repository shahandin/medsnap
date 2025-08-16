export const dynamic = "force-dynamic"

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default async function SignInPage() {
  try {
    // If Supabase is not configured, show setup message directly
    if (!isSupabaseConfigured) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
        </div>
      )
    }

    // Check if user is already logged in
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is logged in, redirect to home page
    if (session) {
      redirect("/")
    }
  } catch (error) {
    console.warn("Build-time Supabase error:", error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}
