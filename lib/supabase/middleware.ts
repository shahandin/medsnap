import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = [
    "/signin",
    "/signup",
    "/auth/callback",
    "/auth/sign-up",
    "/", // Root path
  ]

  const locales = ["en", "es"] // Should match your i18n routing config
  const localeHomePaths = locales.map((locale) => `/${locale}`)

  const pathname = request.nextUrl.pathname
  const isPublicPath =
    publicPaths.includes(pathname) ||
    localeHomePaths.includes(pathname) ||
    publicPaths.some((path) => pathname.startsWith(path + "/")) ||
    locales.some((locale) => publicPaths.some((path) => pathname.startsWith(`/${locale}${path}`)))

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()

    const currentLocale = locales.find((locale) => pathname.startsWith(`/${locale}`))
    url.pathname = currentLocale ? `/${currentLocale}/signin` : "/signin"

    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
