import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return
  }

  const hasLocale = routing.locales.some((locale) => request.nextUrl.pathname.startsWith(`/${locale}`))

  if (!hasLocale) {
    const intlResponse = intlMiddleware(request)
    if (intlResponse.status >= 300 && intlResponse.status < 400) {
      return intlResponse
    }
  }

  const supabaseResponse = await updateSession(request)
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
