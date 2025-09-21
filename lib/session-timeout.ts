"use client"

import { useEffect, useRef } from "react"

interface UseSessionTimeoutOptions {
  timeoutMinutes: number
  onTimeout: () => void
}

export function useSessionTimeout({ timeoutMinutes, onTimeout }: UseSessionTimeoutOptions) {
  const lastActivity = useRef(Date.now())

  useEffect(() => {
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

    return () => clearInterval(interval)
  }, [timeoutMinutes, onTimeout])
}
