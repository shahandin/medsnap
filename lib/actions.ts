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
  console.log("[v0] signIn: Email value:", email?.toString())

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
      hasRefreshToken: !!result.refresh_token,
      hasUser: !!result.user,
      errorMessage: result.error_description || result.error,
      userEmail: result.user?.email,
      expiresIn: result.expires_in,
    })

    console.log("[v0] signIn: Full Supabase response keys:", Object.keys(result || {}))
    if (result.user) {
      console.log("[v0] signIn: User data:", {
        id: result.user.id,
        email: result.user.email,
        emailConfirmed: result.user.email_confirmed_at,
        createdAt: result.user.created_at,
      })
    }

    if (result.error) {
      console.log("[v0] signIn: Authentication failed:", result.error_description || result.error)
      const errorMessage = result.error_description || result.error

      if (errorMessage.includes("Invalid login credentials")) {
        return { error: "Invalid email or password. Please check your credentials and try again." }
      } else if (errorMessage.includes("Email not confirmed")) {
        return { error: "Please check your email and click the confirmation link before signing in." }
      } else if (errorMessage.includes("Too many requests")) {
        return { error: "Too many login attempts. Please wait a few minutes and try again." }
      } else {
        return { error: `Authentication failed: ${errorMessage}` }
      }
    }

    // Store session in cookies
    console.log("[v0] signIn: Storing session in cookies...")
    const cookieStore = cookies()

    console.log("[v0] signIn: Cookie store available:", !!cookieStore)
    console.log("[v0] signIn: Access token to store:", result.access_token ? "present" : "missing")

    if (result.access_token) {
      try {
        cookieStore.set("sb-access-token", result.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: result.expires_in || 3600,
        })
        console.log("[v0] signIn: Cookie set successfully with expiry:", result.expires_in || 3600)

        const verifyToken = cookieStore.get("sb-access-token")
        console.log("[v0] signIn: Cookie verification - token exists:", !!verifyToken?.value)
        console.log("[v0] signIn: Cookie verification - token length:", verifyToken?.value?.length || 0)
      } catch (cookieError) {
        console.error("[v0] signIn: Cookie setting failed:", cookieError)
        return { error: "Failed to store authentication session" }
      }
    } else {
      console.log("[v0] signIn: No access token in response")
      return {
        error: "Authentication failed - no access token received. The user account may not exist or may have issues.",
      }
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
      console.log("[v0] ❌ VALIDATION ERROR: Invalid application data provided")
      console.log("[v0] 📊 Application data type:", typeof applicationData)
      console.log("[v0] 📊 Application data value:", applicationData)
      return { success: false, error: "Invalid application data provided" }
    }

    if (!benefitType || typeof benefitType !== "string") {
      console.log("[v0] ❌ VALIDATION ERROR: Invalid benefit type provided")
      console.log("[v0] 📊 Benefit type:", benefitType)
      return { success: false, error: "Invalid benefit type provided" }
    }

    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      console.log("[v0] ❌ AUTHENTICATION ERROR: No access token found for submission")
      console.log(
        "[v0] 🔍 Available cookies:",
        cookieStore.getAll().map((c) => c.name),
      )
      return { success: false, error: "You must be logged in to submit an application. Please sign in and try again." }
    }

    console.log("[v0] ✅ Access token found for submission")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] 🔧 Environment check - URL exists:", !!supabaseUrl, "Key exists:", !!supabaseAnonKey)

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("[v0] ❌ CONFIGURATION ERROR: Supabase configuration missing for submission")
      return { success: false, error: "Service configuration error. Please contact support." }
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
      console.log("[v0] ❌ AUTHENTICATION ERROR: Failed to get user for submission, status:", userResponse.status)
      console.log("[v0] ❌ User API error:", userError)

      if (userResponse.status === 401) {
        return {
          success: false,
          error: "Your session has expired. Please sign in again and try submitting your application.",
        }
      }

      return {
        success: false,
        error: "Authentication failed. Please sign in again and try submitting your application.",
      }
    }

    const userData = await userResponse.json().catch(() => null)
    if (!userData || !userData.id) {
      console.log("[v0] ❌ AUTHENTICATION ERROR: Invalid user data received")
      console.log("[v0] 📊 User data:", userData)
      return {
        success: false,
        error: "Invalid user session. Please sign in again and try submitting your application.",
      }
    }

    const userId = userData.id
    console.log("[v0] ✅ User ID retrieved for submission:", userId)

    console.log("[v0] 🔍 Checking for existing applications of type:", benefitType)
    const existingAppResponse = await fetch(
      `${supabaseUrl}/rest/v1/applications?user_id=eq.${userId}&benefit_type=eq.${benefitType}&select=id,status,submitted_at`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (existingAppResponse.ok) {
      const existingApps = await existingAppResponse.json()
      console.log("[v0] 📊 Existing applications found:", existingApps?.length || 0)

      if (existingApps && existingApps.length > 0) {
        console.log("[v0] ❌ DUPLICATE ERROR: User already has an application for this benefit type")
        console.log("[v0] 📋 Existing application details:", existingApps[0])
        return {
          success: false,
          error: `You have already submitted a ${benefitType} application. You can only submit one application per benefit type.`,
        }
      }
    } else {
      console.log("[v0] ⚠️ WARNING: Could not check for existing applications, status:", existingAppResponse.status)
    }

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
      console.log("[v0] ❌ DATABASE ERROR: Failed to save application, status:", submitResponse.status)
      console.log("[v0] ❌ Submission error details:", error)

      if (submitResponse.status === 409) {
        return {
          success: false,
          error: "A duplicate application was detected. You may have already submitted this application.",
        }
      } else if (submitResponse.status === 401) {
        return {
          success: false,
          error: "Your session has expired. Please sign in again and try submitting your application.",
        }
      } else if (submitResponse.status === 400) {
        return { success: false, error: "Invalid application data. Please review your information and try again." }
      }

      return {
        success: false,
        error: "Failed to submit application. Please try again or contact support if the problem persists.",
      }
    }

    const submittedApplication = await submitResponse.json().catch(() => null)
    console.log("[v0] 📋 Database response data:", submittedApplication)

    const applicationId = submittedApplication?.[0]?.id

    if (!applicationId) {
      console.log("[v0] ❌ DATABASE ERROR: No application ID returned from database")
      return { success: false, error: "Submission failed - application was not properly saved. Please try again." }
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
    console.error("[v0] ❌ CRITICAL EXCEPTION in submitApplication:", error)
    console.error("[v0] ❌ Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[v0] ❌ Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("[v0] ❌ Error stack:", error instanceof Error ? error.stack : "No stack trace")

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return {
          success: false,
          error: "The submission request timed out. Please check your internet connection and try again.",
        }
      } else if (error.message.includes("fetch")) {
        return {
          success: false,
          error: "Network error occurred during submission. Please check your internet connection and try again.",
        }
      }
    }

    return {
      success: false,
      error:
        "An unexpected error occurred during submission. Please try again or contact support if the problem persists.",
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
