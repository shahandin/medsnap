"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function saveApplicationProgress(applicationData: any, currentStep: number, applicationId?: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const benefitType = applicationData?.benefitType || ""

    // Only save if benefit type is selected (after Step 0)
    if (!benefitType || benefitType === "") {
      console.log("[v0] 🚫 Save blocked: No benefit type selected")
      return { success: false, error: "No benefit type selected yet" }
    }

    // Map benefit types to application_type values
    let applicationType: string
    if (benefitType === "medicaid") {
      applicationType = "medicaid"
    } else if (benefitType === "snap") {
      applicationType = "snap"
    } else if (benefitType === "both") {
      applicationType = "both"
    } else {
      console.log("[v0] 🚫 Invalid benefit type:", benefitType)
      return { success: false, error: "Invalid benefit type" }
    }

    console.log("[v0] 💾 Starting save operation:", {
      userId: user.id,
      applicationType,
      benefitType,
      currentStep,
      hasApplicationId: !!applicationId,
    })

    if (applicationId) {
      console.log("[v0] 🔄 Updating existing record:", applicationId)
      const { data, error } = await supabase
        .from("application_progress")
        .update({
          application_data: applicationData,
          current_step: currentStep,
          application_type: applicationType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("user_id", user.id)
        .select()

      if (error) {
        console.log("[v0] ❌ Update failed:", error)
        return { success: false, error: `Failed to update progress: ${error.message}` }
      }

      console.log("[v0] ✅ Update successful:", data)
      return { success: true, applicationId: data?.[0]?.id }
    } else {
      console.log("[v0] 🆕 Attempting UPSERT with constraint: user_id,application_type")
      const { data, error } = await supabase
        .from("application_progress")
        .upsert(
          {
            user_id: user.id,
            application_type: applicationType,
            application_data: applicationData,
            current_step: currentStep,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,application_type",
          },
        )
        .select()

      if (error) {
        console.log("[v0] ❌ UPSERT failed:", error)
        return { success: false, error: `Failed to save progress: ${error.message}` }
      }

      console.log("[v0] ✅ UPSERT successful:", data)
      return { success: true, applicationId: data?.[0]?.id }
    }
  } catch (error) {
    console.log("[v0] ❌ Save function crashed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadApplicationProgress(applicationId?: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null }
    }

    let query = supabase.from("application_progress").select("*")

    if (applicationId) {
      query = query.eq("id", applicationId)
    } else {
      query = query.eq("user_id", user.id).order("updated_at", { ascending: false })
    }

    const { data, error } = await query.limit(1)

    if (!error && data && data.length > 0) {
      return {
        data: {
          applicationData: data[0].application_data,
          currentStep: data[0].current_step,
          applicationId: data[0].id,
        },
      }
    }

    return { data: null }
  } catch (error) {
    return { data: null }
  }
}

export async function clearApplicationProgress(applicationId?: string, applicationType?: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    let query = supabase.from("application_progress").delete().eq("user_id", user.id)

    // If specific applicationId provided, only delete that record
    if (applicationId) {
      query = query.eq("id", applicationId)
    }
    // If specific application type provided, only delete records of that type
    else if (applicationType) {
      query = query.eq("application_type", applicationType)
    }
    // If neither provided, don't delete anything (preserve existing applications)
    else {
      console.log("[v0] No specific criteria provided, skipping clear operation")
      return { success: true }
    }

    const { error } = await query

    if (!error) {
      return { success: true }
    } else {
      return { success: false, error: error.message }
    }
  } catch (error) {
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

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to submit an application. Please sign in and try again.",
      }
    }

    const { data: existingApps } = await supabase
      .from("applications")
      .select("id,status,submitted_at")
      .eq("user_id", user.id)
      .eq("benefit_type", benefitType)

    if (existingApps && existingApps.length > 0) {
      return {
        success: false,
        error: `You have already submitted a ${benefitType} application. You can only submit one application per benefit type.`,
      }
    }

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
      return {
        success: false,
        error: "Failed to submit application. Please try again or contact support if the problem persists.",
      }
    }

    const applicationId = submittedApplication[0].id

    const { error: cleanupError } = await supabase
      .from("application_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("application_type", benefitType)

    return {
      success: true,
      application: {
        id: applicationId,
        status: "submitted",
        submittedAt: submittedApplication[0].submitted_at,
      },
    }
  } catch (error) {
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
