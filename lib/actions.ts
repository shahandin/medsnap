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
    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      console.log("No access token found, skipping save")
      return { success: false, error: "Not authenticated" }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing")
    }

    // First, try to get the user ID from the token
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!userResponse.ok) {
      return { success: false, error: "Failed to get user" }
    }

    const userData = await userResponse.json()
    const userId = userData.id

    const finalApplicationId = applicationId || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const response = await fetch(`${supabaseUrl}/rest/v1/application_progress?on_conflict=user_id,application_id`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id: userId,
        application_id: finalApplicationId,
        application_data: applicationData,
        current_step: currentStep,
        updated_at: new Date().toISOString(),
      }),
    })

    if (response.ok) {
      console.log("✅ Application progress saved successfully")
      return { success: true, applicationId: finalApplicationId }
    } else {
      const error = await response.text()
      console.error("❌ Failed to save progress:", error)
      return { success: false, error }
    }
  } catch (error) {
    console.error("❌ Error saving application progress:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadApplicationProgress(applicationId?: string) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return { data: null }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing")
    }

    let queryUrl = `${supabaseUrl}/rest/v1/application_progress?select=*&order=updated_at.desc`
    if (applicationId) {
      queryUrl += `&application_id=eq.${applicationId}`
    } else {
      queryUrl += `&limit=1`
    }

    const response = await fetch(queryUrl, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data && data.length > 0) {
        console.log("✅ Application progress loaded successfully")
        return {
          data: {
            applicationData: data[0].application_data,
            currentStep: data[0].current_step,
            applicationId: data[0].application_id,
          },
        }
      }
    }

    return { data: null }
  } catch (error) {
    console.error("❌ Error loading application progress:", error)
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
      throw new Error("Supabase configuration missing")
    }

    let deleteUrl = `${supabaseUrl}/rest/v1/application_progress`
    if (applicationId) {
      deleteUrl += `?application_id=eq.${applicationId}`
    }

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      console.log("✅ Application progress cleared successfully")
      return { success: true }
    } else {
      const error = await response.text()
      console.error("❌ Failed to clear progress:", error)
      return { success: false, error }
    }
  } catch (error) {
    console.error("❌ Error clearing application progress:", error)
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
