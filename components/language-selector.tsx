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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    console.log("[v0] LanguageSelector mounted with custom dropdown")
    console.log("[v0] Current language:", language)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside, true)
      return () => document.removeEventListener("mousedown", handleClickOutside, true)
    }
  }, [isOpen])

  const currentLanguage = LANGUAGES[language]

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Toggle clicked, current isOpen:", isOpen)
    setIsOpen(!isOpen)
    console.log("[v0] Setting isOpen to:", !isOpen)
  }

  const handleLanguageChange = (code: Language) => {
    console.log("[v0] Language selected:", code)
    setLanguage(code)
    setIsOpen(false)
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
          className="fixed inset-0 z-[99998]"
          onClick={() => setIsOpen(false)}
          style={{ backgroundColor: "transparent" }}
        />
      )}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-[99999] max-h-64 overflow-y-auto">
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
