import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes, Next.js internals, and static files
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return
  }

  const intlResponse = intlMiddleware(request)

  // If i18n middleware wants to redirect, let it handle the routing
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse
  }

  // The intlResponse contains the rewritten request with proper locale handling
  const authResponse = await updateSession(request)

  if (authResponse.status >= 300 && authResponse.status < 400) {
    // Auth wants to redirect - preserve any i18n headers
    const finalResponse = authResponse.clone()
    intlResponse.headers.forEach((value, key) => {
      if (!finalResponse.headers.has(key)) {
        finalResponse.headers.set(key, value)
      }
    })
    return finalResponse
  }

  intlResponse.headers.forEach((value, key) => {
    if (!authResponse.headers.has(key)) {
      authResponse.headers.set(key, value)
    }
  })

  return authResponse
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
