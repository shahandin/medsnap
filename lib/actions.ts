"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function makeSupabaseRequest(endpoint: string, options: any = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration missing")
  }

  const response = await fetch(`${supabaseUrl}${endpoint}`, {
    ...options,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  return response.json()
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

  try {
    const result = await makeSupabaseRequest("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({
        email: email.toString(),
        password: password.toString(),
      }),
    })

    if (result.error) {
      return { error: result.error_description || result.error }
    }

    // Store session in cookies
    const cookieStore = cookies()
    if (result.access_token) {
      cookieStore.set("sb-access-token", result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: result.expires_in || 3600,
      })
    }

    return { success: true }
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

  try {
    const result = await makeSupabaseRequest("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({
        email: email.toString(),
        password: password.toString(),
      }),
    })

    if (result.error) {
      return { error: result.error_description || result.error }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  cookieStore.delete("sb-access-token")
  redirect("/signin")
}

export async function saveApplicationProgress(applicationData: any, currentStep: number) {
  return { success: true }
}

export async function loadApplicationProgress() {
  return { data: null }
}

export async function submitApplication(applicationData: any, benefitType: string) {
  return { success: true, application: { id: "mock-id" } }
}

export async function clearApplicationProgress() {
  return { success: true }
}

export async function getSubmittedApplications() {
  return { data: [] }
}

export async function saveAndSignOut(applicationData: any, currentStep: number) {
  await saveApplicationProgress(applicationData, currentStep)
  redirect("/")
}
