let supabase: any
let createClient: any

try {
  const { createClient: supabaseCreateClient } = require("@supabase/supabase-js")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (supabaseUrl && supabaseAnonKey) {
    supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey)
  } else {
    // Fallback client for when env vars aren't available
    supabase = {
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
    }
  }

  createClient = supabaseCreateClient
} catch (error) {
  console.log("[v0] Supabase import failed, using fallback")
  // Fallback client when import fails
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  }

  createClient = () => supabase
}

export { supabase, createClient }
