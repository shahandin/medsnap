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

export async function saveApplicationProgress(applicationData: any, currentStep: number, applicationId?: string) {
  try {
    console.log("[v0] 🔄 Starting saveApplicationProgress...")
    console.log("[v0] 📊 Data to save:", { currentStep, hasApplicationData: !!applicationData, applicationId })

    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      console.log("[v0] ❌ No access token found, skipping save")
      return { success: false, error: "Not authenticated" }
    }

    console.log("[v0] ✅ Access token found, proceeding with save")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("[v0] ❌ Supabase configuration missing")
      throw new Error("Supabase configuration missing")
    }

    // First, try to get the user ID from the token
    console.log("[v0] 🔍 Fetching user data from token...")
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!userResponse.ok) {
      console.log("[v0] ❌ Failed to get user, status:", userResponse.status)
      return { success: false, error: "Failed to get user" }
    }

    const userData = await userResponse.json()
    const userId = userData.id
    console.log("[v0] ✅ User ID retrieved:", userId)

    const saveData = {
      user_id: userId,
      application_data: applicationData,
      current_step: currentStep,
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] 💾 Attempting to save to database...")
    const response = await fetch(`${supabaseUrl}/rest/v1/application_progress?upsert=true`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(saveData),
    })

    if (response.ok) {
      console.log("[v0] ✅ Application progress saved successfully")
      return { success: true }
    } else {
      const error = await response.text()
      console.log("[v0] ❌ Database save failed, status:", response.status)
      console.log("[v0] ❌ Error details:", error)
      return { success: false, error }
    }
  } catch (error) {
    console.error("[v0] ❌ Exception in saveApplicationProgress:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadApplicationProgress(applicationId?: string) {
  try {
    console.log("[v0] 🔄 Starting loadApplicationProgress...")

    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      console.log("[v0] ❌ No access token found for loading")
      return { data: null }
    }

    console.log("[v0] ✅ Access token found for loading")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("[v0] ❌ Supabase configuration missing for loading")
      throw new Error("Supabase configuration missing")
    }

    const queryUrl = `${supabaseUrl}/rest/v1/application_progress?select=*&limit=1`
    console.log("[v0] 🔍 Querying database for saved progress...")

    const response = await fetch(queryUrl, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log("[v0] 📊 Database query successful, records found:", data?.length || 0)

      if (data && data.length > 0) {
        console.log("[v0] ✅ Application progress loaded successfully")
        console.log(
          "[v0] 📋 Loaded data - Step:",
          data[0].current_step,
          "Has application data:",
          !!data[0].application_data,
        )
        return {
          data: {
            applicationData: data[0].application_data,
            currentStep: data[0].current_step,
          },
        }
      } else {
        console.log("[v0] ℹ️ No saved progress found")
      }
    } else {
      console.log("[v0] ❌ Database query failed, status:", response.status)
      const error = await response.text()
      console.log("[v0] ❌ Query error details:", error)
    }

    return { data: null }
  } catch (error) {
    console.error("[v0] ❌ Exception in loadApplicationProgress:", error)
    return { data: null }
  }
}

export async function clearApplicationProgress(applicationId?: string) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return { success: false, error: "Not authenticated" }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("[v0] ❌ Supabase configuration missing")
      throw new Error("Supabase configuration missing")
    }

    const deleteUrl = `${supabaseUrl}/rest/v1/application_progress`

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      console.log("[v0] ✅ Application progress cleared successfully")
      return { success: true }
    } else {
      const error = await response.text()
      console.log("[v0] ❌ Failed to clear progress, status:", response.status)
      console.log("[v0] ❌ Error details:", error)
      return { success: false, error }
    }
  } catch (error) {
    console.error("[v0] ❌ Error clearing application progress:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function submitApplication(applicationData: any, benefitType: string) {
  return { success: true, application: { id: "mock-id" } }
}

export async function getSubmittedApplications() {
  return { data: [] }
}

export async function saveAndSignOut(applicationData: any, currentStep: number) {
  await saveApplicationProgress(applicationData, currentStep)
  redirect("/")
}
