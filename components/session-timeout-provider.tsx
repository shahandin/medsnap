"use client"

import type React from "react"
import { useSessionTimeout } from "@/lib/session-timeout"

interface SessionTimeoutProviderProps {
  children: React.ReactNode
}

export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  const { signOut } = useSessionTimeout({
    timeoutMinutes: 20, // 20 minutes total session
    onTimeout: () => {
      signOut() // Direct sign out after 20 minutes
    },
  })

  return <>{children}</>
}
