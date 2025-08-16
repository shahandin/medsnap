let createClient: any
let supabase: any = null

try {
  const supabaseModule = require("@supabase/supabase-js")
  createClient = supabaseModule.createClient
} catch (error) {
  console.warn("Supabase import failed, using fallback")
  // Fallback createClient function
  createClient = () => ({
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  })
}

export const isSupabaseConfigured = (() => {
  try {
    return (
      typeof process !== "undefined" &&
      process.env &&
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
    )
  } catch {
    return false
  }
})()

try {
  supabase = isSupabaseConfigured
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    : createClient() // Use fallback client
} catch (error) {
  console.warn("Failed to create Supabase client, using fallback")
  supabase = createClient() // Use fallback client
}

export { supabase, createClient }
