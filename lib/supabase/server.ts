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

          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${authCookie.value}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

export const createServerClient = createClient

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
