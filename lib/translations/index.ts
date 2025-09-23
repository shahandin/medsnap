// Translation system core functionality
export type Language = "en" | "es" | "fr" | "zh" | "ar" | "ru" | "pt" | "de" | "it" | "ja"

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
  ru: { name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  pt: { name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  it: { name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  ja: { name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
}

export const DEFAULT_LANGUAGE: Language = "en"

export { en } from "./en"
export { es } from "./es"
export { fr } from "./fr"
export { zh } from "./zh"
export { ar } from "./ar"
export { ru } from "./ru"
export { pt } from "./pt"
export { de } from "./de"
export { it } from "./it"
export { ja } from "./ja"
