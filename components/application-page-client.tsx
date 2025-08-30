"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import BenefitsApplicationClient from "@/components/benefits-application-client"
import { createClient } from "@/lib/supabase/client"

export function ApplicationPageClient() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const fresh = searchParams.get("fresh") === "true"
  const continueId = searchParams.get("continue")
  const startFresh = fresh && !continueId

  console.log("[v0] 🔄 ApplicationPageClient - URL search params:", Object.fromEntries(searchParams.entries()))
  console.log("[v0] 🔄 ApplicationPageClient - fresh:", fresh, "continueId:", continueId, "startFresh:", startFresh)

  useEffect(() => {
    const checkAuthAndRoute = async () => {
      try {
        console.log("[v0] 🔍 Checking authentication...")
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        })

        console.log("[v0] 📡 Auth API response status:", response.status)

        if (response.ok) {
          const userData = await response.json()
          console.log("[v0] 👤 User data received:", userData)
          if (userData.user) {
            console.log("[v0] ✅ User authenticated, setting user state")
            setUser(userData.user)

            await handleRouting(userData.user)
            return
          }
        }
      } catch (error) {
        console.error("[v0] ❌ Auth check failed with error:", error)
        setError(`Authentication error: ${error.message}`)
        setLoading(false)
        return
      }

      console.log("[v0] 🔄 No user found, redirecting to signin")
      router.push("/signin")
    }

    const handleRouting = async (user: any) => {
      try {
        // If user has specific parameters, proceed directly
        if (fresh || continueId) {
          console.log("[v0] 🎯 Direct routing - fresh:", fresh, "continueId:", continueId)
          setLoading(false)
          return
        }

        // Check user's application state to determine routing
        console.log("[v0] 🔍 Checking user application state...")
        const supabase = createClient()

        const { data: incompleteApps, error: progressError } = await supabase
          .from("application_progress")
          .select("*")
          .eq("user_id", user.id)

        if (progressError) {
          console.error("[v0] ❌ Error checking incomplete applications:", progressError)
          setLoading(false)
          return
        }

        console.log("[v0] 📊 Found incomplete applications:", incompleteApps?.length || 0)

        // If user has incomplete applications, redirect to choice page
        if (incompleteApps && incompleteApps.length > 0) {
          console.log("[v0] 🔄 User has incomplete applications, redirecting to choice page")
          router.push("/application-choice")
          return
        }

        // If no incomplete applications, start fresh
        console.log("[v0] 🎯 No incomplete applications, starting fresh")
        setLoading(false)
      } catch (error) {
        console.error("[v0] ❌ Error in routing logic:", error)
        setLoading(false)
      }
    }

    try {
      checkAuthAndRoute()
    } catch (error) {
      console.error("[v0] ❌ Critical error in auth check:", error)
      setError(`Critical authentication error: ${error.message}`)
      setLoading(false)
    }
  }, [router, fresh, continueId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  console.log(
    "[v0] 🎯 About to render BenefitsApplicationClient with startFresh:",
    startFresh,
    "continueId:",
    continueId,
  )

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />
      <main className="flex-1">
        <ErrorBoundary>
          <BenefitsApplicationClient startFresh={startFresh} continueId={continueId} />
        </ErrorBoundary>
      </main>
      <SiteFooter />
    </div>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; startFresh: boolean; continueId: string | null },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; startFresh: boolean; continueId: string | null }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] ❌ Error boundary caught error:", error)
    console.error("[v0] ❌ Error info:", errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">Application Error: {this.state.error?.message || "Unknown error"}</div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
