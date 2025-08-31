"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function saveApplicationProgress(applicationData: any, currentStep: number, applicationId?: string) {
  try {
    console.log("[v0] 🔄 Starting saveApplicationProgress...")
    console.log("[v0] 📊 Data to save:", { currentStep, hasApplicationData: !!applicationData, applicationId })

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] ❌ No authenticated user found, skipping save")
      return { success: false, error: "Not authenticated" }
    }

    console.log("[v0] ✅ Authenticated user found:", user.id)

    let response
    if (applicationId) {
      // Update existing specific application
      console.log("[v0] 🔄 Updating specific application:", applicationId)
      const { data, error } = await supabase
        .from("application_progress")
        .update({
          application_data: applicationData,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("user_id", user.id)

      if (!error) {
        console.log("[v0] ✅ Specific application updated successfully")
        return { success: true, applicationId }
      }
    } else {
      // Check if user has any existing progress (for backward compatibility)
      console.log("[v0] 🔍 Checking for existing progress...")
      const { data: existingRecords } = await supabase
        .from("application_progress")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)

      const hasExistingRecord = existingRecords && existingRecords.length > 0

      if (hasExistingRecord) {
        // Update the existing record
        const existingId = existingRecords[0].id
        console.log("[v0] 🔄 Updating existing record:", existingId)
        const { error } = await supabase
          .from("application_progress")
          .update({
            application_data: applicationData,
            current_step: currentStep,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingId)

        if (!error) {
          console.log("[v0] ✅ Existing record updated successfully")
          return { success: true, applicationId: existingId }
        }
      } else {
        // Create new record
        console.log("[v0] ➕ Creating new application record...")
        const { data, error } = await supabase
          .from("application_progress")
          .insert({
            user_id: user.id,
            application_data: applicationData,
            current_step: currentStep,
            updated_at: new Date().toISOString(),
          })
          .select()

        if (!error && data && data[0]) {
          console.log("[v0] ✅ New application created with ID:", data[0].id)
          return { success: true, applicationId: data[0].id }
        }
      }
    }

    console.log("[v0] ❌ Database save failed")
    return { success: false, error: "Failed to save progress" }
  } catch (error) {
    console.error("[v0] ❌ Exception in saveApplicationProgress:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadApplicationProgress(applicationId?: string) {
  try {
    console.log("[v0] 🔄 Starting loadApplicationProgress with ID:", applicationId)

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] ❌ No authenticated user found for loading")
      return { data: null }
    }

    console.log("[v0] ✅ Authenticated user found for loading:", user.id)

    let query = supabase.from("application_progress").select("*")

    if (applicationId) {
      // Load specific application
      console.log("[v0] 🔍 Loading specific application:", applicationId)
      query = query.eq("id", applicationId)
    } else {
      // Load most recent application for backward compatibility
      console.log("[v0] 🔍 Loading most recent application for user...")
      query = query.eq("user_id", user.id).order("updated_at", { ascending: false })
    }

    const { data, error } = await query.limit(1)

    if (!error && data && data.length > 0) {
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

    return { data: null }
  } catch (error) {
    console.error("[v0] ❌ Exception in loadApplicationProgress:", error)
    return { data: null }
  }
}

export async function clearApplicationProgress(applicationId?: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase.from("application_progress").delete().eq("user_id", user.id)

    if (!error) {
      console.log("[v0] ✅ Application progress cleared successfully")
      return { success: true }
    } else {
      console.log("[v0] ❌ Failed to clear progress:", error)
      return { success: false, error: error.message }
    }
  } catch (error) {
    console.error("[v0] ❌ Error clearing application progress:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function submitApplication(applicationData: any, benefitType: string) {
  try {
    if (!applicationData || typeof applicationData !== "object") {
      return { success: false, error: "Invalid application data provided" }
    }

    if (!benefitType || typeof benefitType !== "string") {
      return { success: false, error: "Invalid benefit type provided" }
    }

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] 🔍 Auth check result:", {
      hasUser: !!user,
      userId: user?.id,
      hasAuthError: !!authError,
      authErrorMessage: authError?.message,
    })

    if (authError || !user) {
      console.log("[v0] ❌ AUTHENTICATION ERROR: No authenticated user found for submission")
      return {
        success: false,
        error: "You must be logged in to submit an application. Please sign in and try again.",
      }
    }

    console.log("[v0] ✅ Authenticated user found for submission:", user.id)
    console.log("[v0] 🚀 Starting application submission...")
    console.log("[v0] 📊 Submitting application for benefit type:", benefitType)

    // Check for existing applications of this type
    console.log("[v0] 🔍 Checking for existing applications of type:", benefitType)
    const { data: existingApps } = await supabase
      .from("applications")
      .select("id,status,submitted_at")
      .eq("user_id", user.id)
      .eq("benefit_type", benefitType)

    if (existingApps && existingApps.length > 0) {
      console.log("[v0] ❌ DUPLICATE ERROR: User already has an application for this benefit type")
      return {
        success: false,
        error: `You have already submitted a ${benefitType} application. You can only submit one application per benefit type.`,
      }
    }

    // Submit the application
    console.log("[v0] 💾 Submitting application to database...")
    const { data: submittedApplication, error: submitError } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        benefit_type: benefitType,
        application_data: applicationData,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (submitError || !submittedApplication || submittedApplication.length === 0) {
      console.log("[v0] ❌ DATABASE ERROR: Failed to save application:", submitError)
      return {
        success: false,
        error: "Failed to submit application. Please try again or contact support if the problem persists.",
      }
    }

    const applicationId = submittedApplication[0].id
    console.log("[v0] ✅ Application submitted successfully with ID:", applicationId)

    // Clear application progress
    console.log("[v0] 🧹 Clearing application progress...")
    await supabase.from("application_progress").delete().eq("user_id", user.id)

    console.log("[v0] 🎉 Submission process completed successfully")

    return {
      success: true,
      application: {
        id: applicationId,
        status: "submitted",
        submittedAt: submittedApplication[0].submitted_at,
      },
    }
  } catch (error) {
    console.error("[v0] ❌ CRITICAL EXCEPTION in submitApplication:", error)
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

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/signin")
}
