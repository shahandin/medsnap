"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { en } from "@/lib/translations/en"
import { es } from "@/lib/translations/es"
import type { TranslationData } from "@/lib/translations/index"

export type Language = "en" | "es"

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const translations: Record<Language, TranslationData> = {
  en,
  es,
}

const DEFAULT_LANGUAGE: Language = "en"

function getTranslation(data: TranslationData, key: string): string {
  const keys = key.split(".")
  let current: any = data

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k]
    } else {
      return key // Return key if translation not found
    }
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
    setIsHydrated(true)

    const savedLanguage = localStorage.getItem("preferred-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
      setLanguageState(savedLanguage)
    }
    setIsLoading(false)
  }, [])

  const setLanguage = (lang: Language) => {
    console.log("[v0] Setting language to:", lang) // Debug log
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", lang)
    }
    console.log("[v0] Language state updated, new language:", lang) // Debug log
  }

  const t = (key: string): string => {
    const currentLang = isHydrated ? language : DEFAULT_LANGUAGE
    return getTranslation(translations[currentLang], key)
  }

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
