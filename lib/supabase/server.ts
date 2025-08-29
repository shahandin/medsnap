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
          order: (orderColumn: string, options?: { ascending?: boolean }) => ({
            then: async () => {
              try {
                // For demo purposes, return empty array for application_progress queries
                if (table === "application_progress") {
                  return { data: [], error: null }
                }
                return { data: [], error: null }
              } catch (error) {
                return { data: null, error }
              }
            },
          }),
        }),
      }),
    }),
  }
}

export { createServerClient as createClient }
