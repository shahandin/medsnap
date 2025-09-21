import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  console.log("[v0] MIDDLEWARE START:", {
    url: request.url,
    pathname: request.nextUrl.pathname,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  })

  // Skip middleware for API routes, Next.js internals, and static files
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.includes(".")
  ) {
    console.log("[v0] SKIPPING middleware for:", request.nextUrl.pathname)
    return
  }

  // Check if path already has a locale
  const hasLocale = routing.locales.some((locale) => request.nextUrl.pathname.startsWith(`/${locale}`))
  console.log("[v0] LOCALE CHECK:", {
    hasLocale,
    availableLocales: routing.locales,
    pathname: request.nextUrl.pathname,
  })

  // Only apply i18n middleware if no locale is present
  if (!hasLocale) {
    console.log("[v0] APPLYING i18n middleware - no locale detected")
    const intlResponse = intlMiddleware(request)
    console.log("[v0] i18n RESPONSE:", {
      status: intlResponse.status,
      statusText: intlResponse.statusText,
      headers: Object.fromEntries(intlResponse.headers.entries()),
      redirectLocation: intlResponse.headers.get("location"),
    })

    if (intlResponse.status >= 300 && intlResponse.status < 400) {
      console.log("[v0] RETURNING i18n redirect to:", intlResponse.headers.get("location"))
      return intlResponse
    }
  } else {
    console.log("[v0] SKIPPING i18n middleware - locale already present")
  }

  // Apply Supabase middleware
  console.log("[v0] APPLYING Supabase middleware")
  const supabaseResponse = await updateSession(request)
  console.log("[v0] SUPABASE RESPONSE:", {
    status: supabaseResponse.status,
    statusText: supabaseResponse.statusText,
    headers: Object.fromEntries(supabaseResponse.headers.entries()),
    redirectLocation: supabaseResponse.headers.get("location"),
  })

  console.log("[v0] MIDDLEWARE END - returning Supabase response")
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
