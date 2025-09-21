"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        router.push("/signin")
        return
      }

      if (user) {
        // Extract locale from current path or default to 'en'
        const pathSegments = pathname.split("/")
        const locale = pathSegments[1] && ["en", "es"].includes(pathSegments[1]) ? pathSegments[1] : "en"

        setTimeout(() => {
          router.push(`/${locale}`)
        }, 100)
      } else {
        router.push("/signin")
      }
    }

    handleAuthCallback()
  }, [router, pathname])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
