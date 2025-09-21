"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("[v0] AuthCallback: Starting auth verification...")

      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.log("[v0] AuthCallback: Auth error:", error)
        router.push("/signin")
        return
      }

      if (user) {
        console.log("[v0] AuthCallback: User authenticated, redirecting to home")
        // Small delay to ensure session is fully established
        setTimeout(() => {
          router.push("/")
        }, 100)
      } else {
        console.log("[v0] AuthCallback: No user found, redirecting to signin")
        router.push("/signin")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
