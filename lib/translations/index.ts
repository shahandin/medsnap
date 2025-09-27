// Translation system core functionality
export type Language = "en" | "es" | "fr" | "zh" | "ar"

export interface TranslationData {
  [key: string]: string | TranslationData
}

export interface Translations {
  [key: string]: TranslationData
}

// Utility function to get nested translation value
export function getTranslation(translations: TranslationData, key: string): string {
  const keys = key.split(".")
  let current: any = translations

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k]
    } else {
      return key // Return key if translation not found
    }
  }

  return typeof current === "string" ? current : key
}

// Language metadata
export const LANGUAGES: Record<Language, { name: string; nativeName: string; flag: string }> = {
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  fr: { name: "French", nativeName: "Français", flag: "🇫🇷" },
  zh: { name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  ar: { name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
}

export const DEFAULT_LANGUAGE: Language = "en"
