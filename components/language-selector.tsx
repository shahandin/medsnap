"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/translation-context"
import { LANGUAGES, type Language } from "@/lib/translations"
import { ChevronDown, Globe } from "lucide-react"

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsMounted(true)
    console.log("[v0] LanguageSelector mounted - client side only")
    console.log("[v0] Current language:", language)
    console.log("[v0] Environment:", process.env.NODE_ENV)
    console.log("[v0] Window available:", typeof window !== "undefined")
    console.log("[v0] Document available:", typeof document !== "undefined")

    if (typeof window !== "undefined") {
      console.log("[v0] Window size:", `${window.innerWidth}x${window.innerHeight}`)
      console.log("[v0] User agent:", window.navigator.userAgent)
      console.log("[v0] Location:", window.location.href)
      console.log("[v0] Is production build:", process.env.NODE_ENV === "production")

      // Check if we're in v0 preview vs production
      const isV0Preview = window.location.hostname.includes("v0.app") || window.location.hostname.includes("localhost")
      console.log("[v0] Is v0 preview:", isV0Preview)

      // Check for any global click handlers that might interfere
      const clickHandlers = []
      document.addEventListener(
        "click",
        (e) => {
          console.log("[v0] GLOBAL CLICK DETECTED:", {
            target: e.target,
            currentTarget: e.currentTarget,
            timestamp: Date.now(),
            coordinates: { x: e.clientX, y: e.clientY },
          })
        },
        true,
      )
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return

    console.log("[v0] isOpen state changed to:", isOpen)
    console.log("[v0] Component refs:", {
      dropdownRef: !!dropdownRef.current,
      buttonRef: !!buttonRef.current,
    })

    if (isOpen && dropdownRef.current) {
      setTimeout(() => {
        const container = dropdownRef.current
        if (!container) {
          console.log("[v0] ERROR: Container ref lost!")
          return
        }

        const rect = container.getBoundingClientRect()
        console.log("[v0] Dropdown container position:", {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          visible: rect.width > 0 && rect.height > 0,
        })

        // Check if dropdown menu is actually rendered
        const dropdownMenu = container.querySelector('div[class*="dropdown-menu"]')
        console.log("[v0] Dropdown menu element found:", !!dropdownMenu)

        if (dropdownMenu) {
          const menuRect = dropdownMenu.getBoundingClientRect()
          const computedStyle = window.getComputedStyle(dropdownMenu)
          console.log("[v0] Dropdown menu details:", {
            position: menuRect,
            styles: {
              zIndex: computedStyle.zIndex,
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              opacity: computedStyle.opacity,
              position: computedStyle.position,
              transform: computedStyle.transform,
              backgroundColor: computedStyle.backgroundColor,
              border: computedStyle.border,
            },
            inViewport:
              menuRect.top >= 0 &&
              menuRect.left >= 0 &&
              menuRect.bottom <= window.innerHeight &&
              menuRect.right <= window.innerWidth,
            actuallyVisible:
              menuRect.width > 0 &&
              menuRect.height > 0 &&
              computedStyle.display !== "none" &&
              computedStyle.visibility !== "hidden",
          })

          // Check all child elements
          const buttons = dropdownMenu.querySelectorAll("button")
          console.log("[v0] Language buttons found:", buttons.length)
          buttons.forEach((btn, i) => {
            const btnRect = btn.getBoundingClientRect()
            console.log(`[v0] Button ${i}:`, {
              text: btn.textContent?.trim(),
              visible: btnRect.width > 0 && btnRect.height > 0,
              position: btnRect,
            })
          })
        } else {
          console.log("[v0] ERROR: Dropdown menu element not found in DOM!")
          console.log("[v0] Container innerHTML:", container.innerHTML)
        }
      }, 10)
    }
  }, [isOpen, isMounted])

  const handleToggle = (event: React.MouseEvent) => {
    console.log("[v0] Toggle clicked - ENTRY")
    console.log("[v0] Event details:", {
      type: event.type,
      target: event.target,
      currentTarget: event.currentTarget,
      timestamp: Date.now(),
      isTrusted: event.isTrusted,
    })

    event.stopPropagation()
    event.preventDefault()

    console.log("[v0] Toggle clicked, current isOpen:", isOpen)
    console.log("[v0] isMounted:", isMounted)

    if (!isMounted) {
      console.log("[v0] Component not mounted yet, ignoring click")
      return
    }

    const newState = !isOpen
    console.log("[v0] Setting isOpen to:", newState)
    setIsOpen(newState)

    setTimeout(() => {
      console.log("[v0] State change verification - isOpen is now:", isOpen)
    }, 10)
  }

  const handleLanguageChange = (code: Language) => {
    console.log("[v0] Language selected:", code)
    setLanguage(code)
    setIsOpen(false)
  }

  const currentLanguage = LANGUAGES[language]
  console.log("[v0] LanguageSelector rendering, isOpen:", isOpen, "isMounted:", isMounted)

  if (!isMounted) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground opacity-50 rounded-lg px-3 py-2 font-medium text-sm"
          disabled
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">Loading...</span>
          <span className="sm:hidden">🌐</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-3 py-2 font-medium transition-all duration-200 text-sm"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="sm:hidden">{currentLanguage.flag}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div
          className="dropdown-menu fixed right-4 top-16 sm:top-20 w-48 bg-background border border-border rounded-md shadow-lg z-[100] sm:absolute sm:right-0 sm:top-full sm:mt-1"
          style={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          }}
        >
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code as Language)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 first:rounded-t-md last:rounded-b-md transition-colors ${
                language === code ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
