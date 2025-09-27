"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/translation-context"
import { LANGUAGES, type Language } from "@/lib/translations"
import { ChevronDown, Globe } from "lucide-react"

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    console.log("[v0] LanguageSelector mounted with custom dropdown")
    console.log("[v0] Current language:", language)
    console.log("[v0] Environment:", process.env.NODE_ENV)
    console.log(
      "[v0] Window size:",
      typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "SSR",
    )
    console.log("[v0] User agent:", typeof window !== "undefined" ? window.navigator.userAgent : "SSR")
  }, [])

  useEffect(() => {
    console.log("[v0] isOpen state changed to:", isOpen)
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      console.log("[v0] Dropdown container position:", {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
      })

      // Check if dropdown menu is actually rendered
      const dropdownMenu = dropdownRef.current.querySelector('div[class*="fixed"], div[class*="absolute"]')
      if (dropdownMenu) {
        const menuRect = dropdownMenu.getBoundingClientRect()
        console.log("[v0] Dropdown menu position:", {
          top: menuRect.top,
          left: menuRect.left,
          width: menuRect.width,
          height: menuRect.height,
          visible: menuRect.width > 0 && menuRect.height > 0,
          zIndex: window.getComputedStyle(dropdownMenu).zIndex,
          display: window.getComputedStyle(dropdownMenu).display,
          visibility: window.getComputedStyle(dropdownMenu).visibility,
          opacity: window.getComputedStyle(dropdownMenu).opacity,
        })

        // Check if menu is actually visible in viewport
        const isInViewport =
          menuRect.top >= 0 &&
          menuRect.left >= 0 &&
          menuRect.bottom <= window.innerHeight &&
          menuRect.right <= window.innerWidth
        console.log("[v0] Dropdown menu in viewport:", isInViewport)

        // Log all computed styles that might affect visibility
        const computedStyle = window.getComputedStyle(dropdownMenu)
        console.log("[v0] Dropdown menu computed styles:", {
          position: computedStyle.position,
          top: computedStyle.top,
          right: computedStyle.right,
          transform: computedStyle.transform,
          overflow: computedStyle.overflow,
          clip: computedStyle.clip,
          clipPath: computedStyle.clipPath,
        })
      } else {
        console.log("[v0] ERROR: Dropdown menu element not found in DOM!")
      }
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      console.log("[v0] Click outside detected, target:", event.target)
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log("[v0] Closing dropdown due to outside click")
        setIsOpen(false)
      }
    }

    if (isOpen) {
      console.log("[v0] Adding click outside listener")
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        console.log("[v0] Removing click outside listener")
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  const currentLanguage = LANGUAGES[language]

  const handleToggle = () => {
    console.log("[v0] Toggle clicked, current isOpen:", isOpen)
    console.log("[v0] Button ref:", buttonRef.current)
    console.log("[v0] Dropdown ref:", dropdownRef.current)

    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      console.log("[v0] Button position:", {
        top: buttonRect.top,
        left: buttonRect.left,
        width: buttonRect.width,
        height: buttonRect.height,
      })
    }

    setIsOpen(!isOpen)
    console.log("[v0] Setting isOpen to:", !isOpen)

    setTimeout(() => {
      console.log("[v0] State after timeout:", !isOpen)
      console.log("[v0] DOM elements after state change:")
      console.log("[v0] - Container:", dropdownRef.current)
      console.log("[v0] - Button:", buttonRef.current)

      if (dropdownRef.current) {
        const dropdown = dropdownRef.current.querySelector('div[class*="fixed"], div[class*="absolute"]')
        console.log("[v0] - Dropdown menu:", dropdown)
        if (dropdown) {
          console.log("[v0] - Dropdown classes:", dropdown.className)
          console.log("[v0] - Dropdown style:", dropdown.getAttribute("style"))
        }
      }
    }, 100)
  }

  const handleLanguageChange = (code: Language) => {
    console.log("[v0] Language selected:", code)
    setLanguage(code)
    setIsOpen(false)
  }

  console.log("[v0] LanguageSelector rendering, isOpen:", isOpen)
  console.log("[v0] Available languages:", Object.keys(LANGUAGES))
  console.log("[v0] Current language object:", currentLanguage)

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
          className="fixed right-4 top-16 sm:top-20 w-48 bg-background border border-border rounded-md shadow-lg z-[100] sm:absolute sm:right-0 sm:top-full sm:mt-1"
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
