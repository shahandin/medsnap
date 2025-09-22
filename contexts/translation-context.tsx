"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { en } from "@/lib/translations/en"
import { es } from "@/lib/translations/es"
import type { TranslationData } from "@/lib/translations/index"

export type Language = "en" | "es"

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, options?: { returnObjects?: boolean; variables?: Record<string, string | number> }) => any
  isLoading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const translations: Record<Language, TranslationData> = {
  en,
  es,
}

const DEFAULT_LANGUAGE: Language = "en"

function getTranslation(data: TranslationData, key: string, returnObjects = false): any {
  const keys = key.split(".")
  let current: any = data

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k]
    } else {
      return key // Return key if translation not found
    }
  }

  if (returnObjects) {
    return current !== undefined ? current : key
  }

  return typeof current === "string" ? current : key
}

interface TranslationProviderProps {
  children: ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    console.log("[v0] TranslationProvider mounting")
    setIsHydrated(true)

    try {
      const savedLanguage = localStorage.getItem("preferred-language") as Language
      console.log("[v0] Saved language from localStorage:", savedLanguage)

      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
        console.log("[v0] Setting language from localStorage:", savedLanguage)
        setLanguageState(savedLanguage)
      } else {
        console.log("[v0] No valid saved language, using default:", DEFAULT_LANGUAGE)
      }
    } catch (error) {
      console.error("[v0] Error accessing localStorage:", error)
    }

    setIsLoading(false)
    console.log("[v0] TranslationProvider initialization complete")
  }, [])

  const setLanguage = (lang: Language) => {
    console.log("[v0] setLanguage called with:", lang)
    console.log("[v0] Current language state:", language)
    console.log("[v0] isHydrated:", isHydrated)

    if (typeof window !== "undefined" && (window as any).applicationContext) {
      console.log("[v0] Application context before language change:", {
        healthInsuranceType: typeof (window as any).applicationContext.applicationData?.hasHealthInsurance,
        healthInsuranceValue: (window as any).applicationContext.applicationData?.hasHealthInsurance,
        healthDisabilityStructure: (window as any).applicationContext.applicationData?.healthDisability
          ? Object.keys((window as any).applicationContext.applicationData.healthDisability)
          : "undefined",
      })
    }

    setLanguageState(lang)
    console.log("[v0] Language state updated to:", lang)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("preferred-language", lang)
        console.log("[v0] Language saved to localStorage:", lang)
      } catch (error) {
        console.error("[v0] Error saving to localStorage:", error)
      }
    } else {
      console.log("[v0] Window not available, skipping localStorage save")
    }

    setTimeout(() => {
      if (typeof window !== "undefined" && (window as any).applicationContext) {
        console.log("[v0] Application context after language change:", {
          healthInsuranceType: typeof (window as any).applicationContext.applicationData?.hasHealthInsurance,
          healthInsuranceValue: (window as any).applicationContext.applicationData?.hasHealthInsurance,
          healthDisabilityStructure: (window as any).applicationContext.applicationData?.healthDisability
            ? Object.keys((window as any).applicationContext.applicationData.healthDisability)
            : "undefined",
        })
      }
    }, 100)
  }

  const t = (key: string, options?: { returnObjects?: boolean; variables?: Record<string, string | number> }): any => {
    const currentLang = isHydrated ? language : DEFAULT_LANGUAGE
    const returnObjects = options?.returnObjects || false
    const variables = options?.variables

    let result = getTranslation(translations[currentLang], key, returnObjects)

    // Only log if translation key is not found (to avoid spam)
    if (result === key) {
      console.log("[v0] Translation not found for key:", key, "in language:", currentLang)
    }

    if (variables && typeof result === "string") {
      Object.entries(variables).forEach(([variableKey, value]) => {
        const placeholder = `{{${variableKey}}}`
        result = result.replace(new RegExp(placeholder, "g"), String(value))
      })
    }

    return result
  }

  console.log("[v0] TranslationProvider rendering with language:", language)

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
