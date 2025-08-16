"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import BenefitsApplicationClient from "@/components/benefits-application-client"

export function ApplicationPageClient() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[v0] 🔍 Checking authentication...")
        const response = await fetch("/api/auth/user", {
          credentials: "include", // Include cookies in the request
        })

        console.log("[v0] 📡 Auth API response status:", response.status)
        console.log("[v0] 📡 Auth API response ok:", response.ok)

        if (response.ok) {
          const userData = await response.json()
          console.log("[v0] 👤 User data received:", userData)
          if (userData.user) {
            console.log("[v0] ✅ User authenticated, setting user state")
            setUser(userData.user)
            setLoading(false)
            return
          } else {
            console.log("[v0] ❌ No user in response data")
          }
        } else {
          console.log("[v0] ❌ Auth API response not ok")
        }
      } catch (error) {
        console.error("[v0] ❌ Auth check failed with error:", error)
      }

      console.log("[v0] 🔄 No user found, redirecting to signin")
      router.push("/signin")
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />
      <main className="flex-1">
        <BenefitsApplicationClient />
      </main>
      <SiteFooter />
    </div>
  )
}
