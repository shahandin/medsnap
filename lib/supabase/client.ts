const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Direct API implementation to bypass import issues
const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (response.ok && data.access_token) {
          // Store session in localStorage
          localStorage.setItem(
            "supabase_session",
            JSON.stringify({
              access_token: data.access_token,
              user: data.user,
              expires_at: Date.now() + data.expires_in * 1000,
            }),
          )
          return { data: { user: data.user }, error: null }
        } else {
          return { data: null, error: data }
        }
      } catch (error) {
        return { data: null, error: { message: "Authentication failed" } }
      }
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()
        return response.ok ? { data, error: null } : { data: null, error: data }
      } catch (error) {
        return { data: null, error: { message: "Sign up failed" } }
      }
    },

    signOut: async () => {
      localStorage.removeItem("supabase_session")
      return { error: null }
    },

    getUser: async () => {
      try {
        const session = localStorage.getItem("supabase_session")
        if (!session) return { data: { user: null }, error: null }

        const parsed = JSON.parse(session)
        if (Date.now() > parsed.expires_at) {
          localStorage.removeItem("supabase_session")
          return { data: { user: null }, error: null }
        }

        return { data: { user: parsed.user }, error: null }
      } catch (error) {
        return { data: { user: null }, error: null }
      }
    },
  },

  // Mock database operations for demo
  from: (table: string) => ({
    select: (columns = "*") => ({
      order: (column: string, options?: { ascending: boolean }) => ({
        then: (resolve: (result: { data: any[]; error: null }) => void) => {
          // Return mock data for documents table
          if (table === "documents") {
            const mockDocuments = JSON.parse(localStorage.getItem("demo_documents") || "[]")
            resolve({ data: mockDocuments, error: null })
          } else {
            resolve({ data: [], error: null })
          }
        },
      }),
      then: (resolve: (result: { data: any[]; error: null }) => void) => {
        if (table === "documents") {
          const mockDocuments = JSON.parse(localStorage.getItem("demo_documents") || "[]")
          resolve({ data: mockDocuments, error: null })
        } else {
          resolve({ data: [], error: null })
        }
      },
    }),

    insert: (data: any) => ({
      then: (resolve: (result: { data: any; error: null }) => void) => {
        // Store in localStorage for demo
        if (table === "documents") {
          const existingDocs = JSON.parse(localStorage.getItem("demo_documents") || "[]")
          const newDoc = {
            ...data,
            id: Date.now().toString(),
            uploaded_at: new Date().toISOString(),
          }
          existingDocs.push(newDoc)
          localStorage.setItem("demo_documents", JSON.stringify(existingDocs))
          resolve({ data: newDoc, error: null })
        } else {
          resolve({ data: data, error: null })
        }
      },
    }),
  }),
}

const createClient = () => supabase

export { supabase, createClient }
