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
  console.log("[v0] signIn: Starting authentication process...")

  if (!formData) {
    console.log("[v0] signIn: Form data is missing")
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  console.log("[v0] signIn: Email provided:", !!email, "Password provided:", !!password)

  if (!email || !password) {
    console.log("[v0] signIn: Missing email or password")
    return { error: "Email and password are required" }
  }

  try {
    console.log("[v0] signIn: Making Supabase auth request...")
    const result = await makeSupabaseRequest("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({
        email: email.toString(),
        password: password.toString(),
      }),
    })

    console.log("[v0] signIn: Supabase response received:", {
      hasError: !!result.error,
      hasAccessToken: !!result.access_token,
      errorMessage: result.error_description || result.error,
    })

    if (result.error) {
      console.log("[v0] signIn: Authentication failed:", result.error_description || result.error)
      return { error: result.error_description || result.error }
    }

    // Store session in cookies
    console.log("[v0] signIn: Storing session in cookies...")
    const cookieStore = cookies()
    if (result.access_token) {
      cookieStore.set("sb-access-token", result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: result.expires_in || 3600,
      })
      console.log("[v0] signIn: Cookie set successfully with expiry:", result.expires_in || 3600)
    } else {
      console.log("[v0] signIn: No access token in response")
    }

    console.log("[v0] signIn: Authentication successful")
    return { success: true }
  } catch (error) {
    console.error("[v0] signIn: Exception occurred:", error)
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

    let response
    if (applicationId) {
      // Update existing specific application
      console.log("[v0] 🔄 Updating specific application:", applicationId)
      response = await fetch(
        `${supabaseUrl}/rest/v1/application_progress?id=eq.${applicationId}&user_id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_data: applicationData,
            current_step: currentStep,
            updated_at: new Date().toISOString(),
          }),
        },
      )

      if (response.ok) {
        console.log("[v0] ✅ Specific application updated successfully")
        return { success: true, applicationId }
      }
    } else {
      // Check if user has any existing progress (for backward compatibility)
      console.log("[v0] 🔍 Checking for existing progress...")
      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/application_progress?user_id=eq.${userId}&select=id&limit=1`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      const existingRecords = await checkResponse.json()
      const hasExistingRecord = existingRecords && existingRecords.length > 0

      if (hasExistingRecord) {
        // Update the existing record
        const existingId = existingRecords[0].id
        console.log("[v0] 🔄 Updating existing record:", existingId)
        response = await fetch(`${supabaseUrl}/rest/v1/application_progress?id=eq.${existingId}`, {
          method: "PATCH",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_data: applicationData,
            current_step: currentStep,
            updated_at: new Date().toISOString(),
          }),
        })

        if (response.ok) {
          console.log("[v0] ✅ Existing record updated successfully")
          return { success: true, applicationId: existingId }
        }
      } else {
        // Create new record
        console.log("[v0] ➕ Creating new application record...")
        const saveData = {
          user_id: userId,
          application_data: applicationData,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
        }

        response = await fetch(`${supabaseUrl}/rest/v1/application_progress`, {
          method: "POST",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(saveData),
        })

        // Get the new application ID from response
        if (response.ok) {
          const newRecord = await response.json()
          if (newRecord && newRecord[0] && newRecord[0].id) {
            console.log("[v0] ✅ New application created with ID:", newRecord[0].id)
            return { success: true, applicationId: newRecord[0].id }
          }
        }
      }
    }

    const error = await response.text()
    console.log("[v0] ❌ Database save failed, status:", response.status)
    console.log("[v0] ❌ Error details:", error)
    return { success: false, error }
  } catch (error) {
    console.error("[v0] ❌ Exception in saveApplicationProgress:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadApplicationProgress(applicationId?: string) {
  try {
    console.log("[v0] 🔄 Starting loadApplicationProgress with ID:", applicationId)

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

    let queryUrl
    if (applicationId) {
      // Load specific application
      console.log("[v0] 🔍 Loading specific application:", applicationId)
      queryUrl = `${supabaseUrl}/rest/v1/application_progress?id=eq.${applicationId}&select=*&limit=1`
    } else {
      // Load most recent application for backward compatibility
      console.log("[v0] 🔍 Loading most recent application for user...")
      queryUrl = `${supabaseUrl}/rest/v1/application_progress?select=*&order=updated_at.desc&limit=1`
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
      console.log("[v0] 📊 Database query successful, records found:", data?.length || 0)

      if (data && data.length > 0) {
        console.log("[v0] ✅ Application progress loaded successfully")
        console.log(
          "[v0] 📋 Loaded data - Step:",
          data[0].current_step,
          "Has application data:",
          !!data[0].application_data,
          "Application ID:",
          data[0].id,
        )
        return {
          data: {
            applicationData: data[0].application_data,
            currentStep: data[0].current_step,
            applicationId: data[0].id,
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
  try {
    console.log("[v0] 🚀 Starting application submission...")
    console.log("[v0] 📊 Submitting application for benefit type:", benefitType)
    console.log("[v0] 📋 Application data keys:", Object.keys(applicationData || {}))

    if (!applicationData || typeof applicationData !== "object") {
      console.log("[v0] ❌ Invalid application data provided")
      return { success: false, error: "Invalid application data" }
    }

    if (!benefitType || typeof benefitType !== "string") {
      console.log("[v0] ❌ Invalid benefit type provided")
      return { success: false, error: "Invalid benefit type" }
    }

    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      console.log("[v0] ❌ No access token found for submission")
      return { success: false, error: "Not authenticated" }
    }

    console.log("[v0] ✅ Access token found for submission")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] 🔧 Environment check - URL exists:", !!supabaseUrl, "Key exists:", !!supabaseAnonKey)

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("[v0] ❌ Supabase configuration missing for submission")
      return { success: false, error: "Service configuration error" }
    }

    console.log("[v0] 🔍 Getting user ID from token...")
    const userResponse = (await Promise.race([
      fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("User API timeout")), 10000)),
    ])) as Response

    console.log("[v0] 📡 User API response status:", userResponse.status)

    if (!userResponse.ok) {
      const userError = await userResponse.text().catch(() => "Unknown error")
      console.log("[v0] ❌ Failed to get user for submission, status:", userResponse.status)
      console.log("[v0] ❌ User API error:", userError)
      return { success: false, error: "Authentication failed" }
    }

    const userData = await userResponse.json().catch(() => null)
    if (!userData || !userData.id) {
      console.log("[v0] ❌ Invalid user data received")
      return { success: false, error: "Invalid user data" }
    }

    const userId = userData.id
    console.log("[v0] ✅ User ID retrieved for submission:", userId)

    console.log("[v0] 💾 Preparing submission data...")
    const submissionData = {
      user_id: userId,
      benefit_type: benefitType,
      application_data: applicationData,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] 📊 Submission data prepared:", {
      user_id: userId,
      benefit_type: benefitType,
      hasApplicationData: !!applicationData,
      applicationDataSize: JSON.stringify(applicationData || {}).length,
      status: "submitted",
    })

    console.log("[v0] 🌐 Making database request to:", `${supabaseUrl}/rest/v1/applications`)

    const submitResponse = (await Promise.race([
      fetch(`${supabaseUrl}/rest/v1/applications`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(submissionData),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Database submission timeout")), 15000)),
    ])) as Response

    console.log("[v0] 📡 Database response status:", submitResponse.status)

    if (!submitResponse.ok) {
      const error = await submitResponse.text().catch(() => "Unknown database error")
      console.log("[v0] ❌ Failed to save application, status:", submitResponse.status)
      console.log("[v0] ❌ Submission error details:", error)
      return { success: false, error: "Failed to submit application" }
    }

    const submittedApplication = await submitResponse.json().catch(() => null)
    console.log("[v0] 📋 Database response data:", submittedApplication)

    const applicationId = submittedApplication?.[0]?.id

    if (!applicationId) {
      console.log("[v0] ❌ No application ID returned from database")
      return { success: false, error: "Submission failed - no ID returned" }
    }

    console.log("[v0] ✅ Application submitted successfully with ID:", applicationId)

    console.log("[v0] 🧹 Clearing application progress...")
    try {
      const clearResponse = (await Promise.race([
        fetch(`${supabaseUrl}/rest/v1/application_progress?user_id=eq.${userId}`, {
          method: "DELETE",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Clear progress timeout")), 5000)),
      ])) as Response

      console.log("[v0] 🧹 Clear progress response status:", clearResponse.status)
      console.log("[v0] ✅ Application progress cleared")
    } catch (clearError) {
      console.log("[v0] ⚠️ Failed to clear progress, but submission was successful:", clearError)
    }

    console.log("[v0] 🎉 Submission process completed successfully")

    return {
      success: true,
      application: {
        id: applicationId,
        status: "submitted",
        submittedAt: submissionData.submitted_at,
      },
    }
  } catch (error) {
    console.error("[v0] ❌ Critical exception in submitApplication:", error)
    console.error("[v0] ❌ Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[v0] ❌ Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("[v0] ❌ Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during submission",
    }
  }
}

export async function getSubmittedApplications() {
  return { data: [] }
}

export async function saveAndSignOut(applicationData: any, currentStep: number) {
  await saveApplicationProgress(applicationData, currentStep)
  redirect("/")
}
