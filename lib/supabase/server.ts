import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return {
    auth: {
      getUser: async () => {
        try {
          console.log("[v0] Auth verification starting...")

          const authCookie = cookieStore.get("sb-access-token")
          if (!authCookie?.value) {
            console.log("[v0] No auth cookie found")
            return { data: { user: null }, error: null }
          }

          const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${authCookie.value}`,
              apikey: process.env.SUPABASE_ANON_KEY!,
            },
          })

          if (!response.ok) {
            console.log("[v0] Auth verification failed:", response.status)
            return { data: { user: null }, error: { message: "Authentication failed" } }
          }

          const user = await response.json()
          console.log("[v0] Auth verification successful")
          return { data: { user }, error: null }
        } catch (error) {
          console.error("[v0] Auth verification error:", error)
          return { data: { user: null }, error }
        }
      },
    },
    from: (table: string) => ({
      select: (columns = "*") => ({
        eq: (column: string, value: any) => ({
          order: (orderColumn: string, options?: { ascending?: boolean }) =>
            Promise.resolve({
              data: table === "application_progress" ? [] : [],
              error: null,
            }),
        }),
      }),
    }),
  }
}

export async function createServerClient() {
  return createClient()
}

export const isSupabaseConfigured = (() => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  console.log("[v0] Supabase config check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseKey?.length || 0,
  })

  const configured =
    typeof supabaseUrl === "string" &&
    supabaseUrl.length > 0 &&
    typeof supabaseKey === "string" &&
    supabaseKey.length > 0

  console.log("[v0] isSupabaseConfigured result:", configured)
  return configured
})()
