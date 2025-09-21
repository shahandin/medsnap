"use client"

import { useEffect, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

interface UseSessionTimeoutOptions {
  timeoutMinutes: number
  onTimeout: () => void
}

export function useSessionTimeout({ timeoutMinutes, onTimeout }: UseSessionTimeoutOptions) {
  const lastActivity = useRef(Date.now())
  const router = useRouter()

  const signOut = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      await supabase.auth.signOut()
      router.push("/signin?reason=timeout")
    } catch (error) {
      console.error("Error signing out:", error)
      // Fallback: redirect anyway
      router.push("/signin?reason=timeout")
    }
  }

  useEffect(() => {
    const updateActivity = () => {
      lastActivity.current = Date.now()
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true)
    })

    const checkTimeout = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity.current
      const timeoutMs = timeoutMinutes * 60 * 1000

      if (timeSinceLastActivity >= timeoutMs) {
        onTimeout()
        return
      }
    }

    const interval = setInterval(checkTimeout, 10000) // Check every 10 seconds

    return () => {
      clearInterval(interval)
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [timeoutMinutes, onTimeout])

  return { signOut }
}
