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
        const response = await fetch("/api/auth/user", {
          credentials: "include", // Include cookies in the request
        })

        if (response.ok) {
          const userData = await response.json()
          if (userData.user) {
            setUser(userData.user)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }

      // If no valid session found, redirect to signin
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
