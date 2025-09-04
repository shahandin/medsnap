"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function saveApplicationProgress(applicationData: any, currentStep: number, applicationId?: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const benefitType =
      applicationData?.benefitType || applicationData?.benefitSelection?.selectedBenefits?.[0] || "unknown"

    console.log("[v0] SaveProgress: Detected benefit type:", benefitType)
    console.log("[v0] SaveProgress: Application data structure:", {
      benefitType: applicationData?.benefitType,
      benefitSelection: applicationData?.benefitSelection,
      selectedBenefits: applicationData?.benefitSelection?.selectedBenefits,
    })

    let response
    if (applicationId) {
      console.log("[v0] SaveProgress: Updating existing application:", applicationId)
      // Update existing specific application
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
        return { success: true, applicationId }
      }
    } else {
      const { data: existingRecords } = await supabase
        .from("application_progress")
        .select("id, application_data")
        .eq("user_id", user.id)

      console.log("[v0] SaveProgress: Found existing records:", existingRecords?.length || 0)
      existingRecords?.forEach((record, index) => {
        const recordBenefitType =
          record.application_data?.benefitType ||
          record.application_data?.benefitSelection?.selectedBenefits?.[0] ||
          "unknown"
        console.log(`[v0] SaveProgress: Existing record ${index + 1} benefit type:`, recordBenefitType)
      })

      // Find existing record for this benefit type
      const existingRecord = existingRecords?.find((record) => {
        const recordBenefitType =
          record.application_data?.benefitType ||
          record.application_data?.benefitSelection?.selectedBenefits?.[0] ||
          "unknown"
        return recordBenefitType === benefitType
      })

      if (existingRecord) {
        console.log("[v0] SaveProgress: Updating existing record for benefit type:", benefitType)
        // Update the existing record for this benefit type
        const { error } = await supabase
          .from("application_progress")
          .update({
            application_data: applicationData,
            current_step: currentStep,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRecord.id)

        if (!error) {
          return { success: true, applicationId: existingRecord.id }
        }
      } else {
        console.log("[v0] SaveProgress: Creating new record for benefit type:", benefitType)
        // Create new record for this benefit type
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
          console.log("[v0] SaveProgress: Successfully created new record:", data[0].id)
          return { success: true, applicationId: data[0].id }
        }
      }
    }

    return { success: false, error: "Failed to save progress" }
  } catch (error) {
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
      // Load specific application
      query = query.eq("id", applicationId)
    } else {
      // Load most recent application for backward compatibility
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

    // Check for existing applications of this type
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

    // Submit the application
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

    const { data: progressRecords } = await supabase
      .from("application_progress")
      .select("id, application_data")
      .eq("user_id", user.id)

    if (progressRecords) {
      for (const record of progressRecords) {
        const recordBenefitType =
          record.application_data?.benefitType ||
          record.application_data?.benefitSelection?.selectedBenefits?.[0] ||
          "unknown"
        if (recordBenefitType === benefitType) {
          await supabase.from("application_progress").delete().eq("id", record.id)
        }
      }
    }

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
