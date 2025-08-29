import { cookies } from "next/headers"

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export const createServerClient = () => {
  const cookieStore = cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value

  return {
    auth: {
      getUser: async () => {
        if (!accessToken) {
          return { data: { user: null }, error: null }
        }

        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
          })

          if (response.ok) {
            const user = await response.json()
            return { data: { user }, error: null }
          }
        } catch (error) {
          console.error("Error getting user:", error)
        }

        return { data: { user: null }, error: null }
      },
    },
    from: (table: string) => ({
      select: (columns = "*") => ({
        eq: (column: string, value: any) => ({
          order: async (orderColumn: string, options?: { ascending?: boolean }) => {
            try {
              if (!accessToken) {
                return { data: [], error: { message: "No access token" } }
              }

              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
              const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

              if (!supabaseUrl || !supabaseAnonKey) {
                return { data: [], error: { message: "Supabase configuration missing" } }
              }

              // Build query URL
              const orderDirection = options?.ascending ? "asc" : "desc"
              const queryUrl = `${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}&order=${orderColumn}.${orderDirection}`

              console.log("[v0] Server client querying:", queryUrl)

              const response = await fetch(queryUrl, {
                headers: {
                  apikey: supabaseAnonKey,
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              })

              if (response.ok) {
                const data = await response.json()
                console.log("[v0] Server client query successful, records:", data?.length || 0)
                return { data: data || [], error: null }
              } else {
                const errorText = await response.text()
                console.error("[v0] Server client query failed:", response.status, errorText)
                return { data: [], error: { message: `Query failed: ${response.status}` } }
              }
            } catch (error) {
              console.error("[v0] Server client query error:", error)
              return { data: [], error: { message: error instanceof Error ? error.message : "Unknown error" } }
            }
          },
        }),
      }),
    }),
  }
}

export { createServerClient as createClient }
