"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import BenefitsApplicationClient from "@/components/benefits-application-client"

export function ApplicationPageClient() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const startFresh = searchParams.get("fresh") === "true"

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
        setError(`Authentication error: ${error.message}`)
        setLoading(false)
        return
      }

      console.log("[v0] 🔄 No user found, redirecting to signin")
      router.push("/signin")
    }

    try {
      checkAuth()
    } catch (error) {
      console.error("[v0] ❌ Critical error in auth check:", error)
      setError(`Critical authentication error: ${error.message}`)
      setLoading(false)
    }
  }, [router])

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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />
      <main className="flex-1">
        <ErrorBoundary>
          <BenefitsApplicationClient startFresh={startFresh} />
        </ErrorBoundary>
      </main>
      <SiteFooter />
    </div>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; startFresh: boolean },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; startFresh: boolean }) {
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
