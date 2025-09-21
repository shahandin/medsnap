import { routing } from "@/i18n/routing"

/**
 * Get the default locale for the application
 * @returns The default locale string
 */
export function getLocale(): string {
  return `/${routing.defaultLocale}`
}

/**
 * Check if a given locale is supported
 * @param locale - The locale to check
 * @returns Whether the locale is supported
 */
export function isValidLocale(locale: string): boolean {
  return routing.locales.includes(locale as any)
}

/**
 * Extract locale from pathname
 * @param pathname - The pathname to extract locale from
 * @returns The extracted locale or default locale
 */
export function extractLocale(pathname: string): string {
  const segments = pathname.split("/")
  const potentialLocale = segments[1]

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale
  }

  return routing.defaultLocale
}
