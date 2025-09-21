import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  const supabaseResponse = await updateSession(request)

  if (supabaseResponse) {
    intlResponse.headers.forEach((value, key) => {
      supabaseResponse.headers.set(key, value)
    })
    return supabaseResponse
  }

  return intlResponse
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
