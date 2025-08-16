"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  try {
    const cookieStore = cookies()
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    })
  } catch (error) {
    console.error("Failed to create Supabase server client:", error)
    return null
  }
}

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return { error: "Service temporarily unavailable" }
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    // Redirect directly from server action
    redirect("/application")
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return { error: "Service temporarily unavailable" }
  }

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/application`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = getSupabaseServerClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect("/signin")
}

export async function saveApplicationProgress(applicationData: any, currentStep: number) {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return { error: "Service temporarily unavailable" }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    const { error } = await supabase.from("application_progress").upsert({
      user_id: user.id,
      application_data: applicationData,
      current_step: currentStep,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return { error: "Failed to save progress" }
    }

    return { success: true }
  } catch (error) {
    console.error("Save progress error:", error)
    return { error: "Failed to save progress" }
  }
}

export async function loadApplicationProgress() {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return { data: null }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null }
    }

    const { data, error } = await supabase
      .from("application_progress")
      .select("application_data, current_step")
      .eq("user_id", user.id)
      .single()

    if (error) {
      return { data: null }
    }

    return { data }
  } catch (error) {
    console.error("Load progress error:", error)
    return { data: null }
  }
}

export async function submitApplication(applicationData: any, benefitType: string) {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return { error: "Service temporarily unavailable" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      benefit_type: benefitType,
      application_data: applicationData,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: "Failed to submit application" }
  }

  return { success: true, application }
}

export async function clearApplicationProgress() {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return { error: "Service temporarily unavailable" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  const { error } = await supabase.from("application_progress").delete().eq("user_id", user.id)

  if (error) {
    return { error: "Failed to clear progress" }
  }

  return { success: true }
}

export async function getSubmittedApplications() {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return { data: [] }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [] }
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })

  if (error) {
    return { data: [] }
  }

  return { data: applications || [] }
}

export async function saveAndSignOut(applicationData: any, currentStep: number) {
  await saveApplicationProgress(applicationData, currentStep)
  redirect("/")
}
