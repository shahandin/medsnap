import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured) {
    console.log("[v0] Middleware: Supabase not configured, skipping session update")
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Middleware: User from Supabase:", user ? "authenticated" : "not authenticated")

  const shouldRedirect =
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/signin") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/signup")

  console.log("[v0] Middleware: Redirect check details:", {
    pathname: request.nextUrl.pathname,
    isNotHomepage: request.nextUrl.pathname !== "/",
    hasNoUser: !user,
    isNotSignin: !request.nextUrl.pathname.startsWith("/signin"),
    isNotAuth: !request.nextUrl.pathname.startsWith("/auth"),
    isNotSignup: !request.nextUrl.pathname.startsWith("/signup"),
    shouldRedirect,
  })

  if (shouldRedirect) {
    console.log("[v0] Middleware: Redirecting unauthenticated user from", request.nextUrl.pathname, "to /signin")
    const url = request.nextUrl.clone()
    url.pathname = "/signin"
    return NextResponse.redirect(url)
  }

  console.log("[v0] Middleware: No redirect needed, continuing to", request.nextUrl.pathname)
  return supabaseResponse
}

export const isSupabaseConfigured = (() => {
  const hasUrl =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0
  const hasKey =
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

  console.log("[v0] Middleware config check:", {
    hasUrl,
    hasKey,
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? "present" : "missing",
    keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "missing",
  })

  return hasUrl && hasKey
})()
