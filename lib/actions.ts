"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { encryptApplicationData, decryptApplicationData } from "@/lib/hipaa-encryption"

function hasEncryptedFields(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false

  for (const key in obj) {
    const value = obj[key]
    if (value && typeof value === "object") {
      if ("iv" in value && "encrypted" in value) {
        return true
      }
      if (hasEncryptedFields(value)) {
        return true
      }
    }
  }
  return false
}

export async function saveApplicationProgress(applicationData: any, currentStep: number, applicationId?: string) {
  try {
    console.log("[v0] SAVE DEBUG - Input data:", {
      hasApplicationData: !!applicationData,
      currentStep,
      applicationId,
      benefitType: applicationData?.benefitType,
      state: applicationData?.state,
      hasPersonalInfo: !!applicationData?.personalInfo,
      personalInfoKeys: applicationData?.personalInfo ? Object.keys(applicationData.personalInfo) : [],
      firstName: applicationData?.personalInfo?.firstName,
      dataSize: JSON.stringify(applicationData || {}).length,
    })

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
      return { success: false, error: "Invalid benefit type" }
    }

    if (!process.env.PHI_ENCRYPTION_KEY) {
      throw new Error("PHI_ENCRYPTION_KEY environment variable is required for HIPAA compliance")
    }

    console.log("[v0] SAVE DEBUG - Before encryption:", {
      dataToEncrypt: applicationData,
      hasPersonalInfo: !!applicationData?.personalInfo,
      personalInfoContent: applicationData?.personalInfo,
    })

    const dataToStore = await encryptApplicationData(applicationData)

    console.log("[v0] SAVE DEBUG - After encryption:", {
      encryptedDataType: typeof dataToStore,
      encryptedDataSize: JSON.stringify(dataToStore || {}).length,
      hasEncryptedFields: hasEncryptedFields(dataToStore),
    })

    if (applicationId) {
      const { data, error } = await supabase
        .from("application_progress")
        .update({
          application_data: dataToStore,
          current_step: currentStep,
          application_type: applicationType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("user_id", user.id)
        .select()

      console.log("[v0] SAVE DEBUG - Update result:", {
        success: !error,
        error: error?.message,
        dataReturned: !!data?.[0],
        applicationId: data?.[0]?.id,
      })

      if (!error && data?.[0]) {
        const { data: verifyData, error: verifyError } = await supabase
          .from("application_progress")
          .select("application_data, current_step")
          .eq("id", data[0].id)
          .single()

        console.log("[v0] SAVE DEBUG - Database verification after update:", {
          verifySuccess: !verifyError,
          verifyError: verifyError?.message,
          hasDataInDB: !!verifyData?.application_data,
          currentStepInDB: verifyData?.current_step,
          dataTypeInDB: typeof verifyData?.application_data,
          hasEncryptedFieldsInDB: hasEncryptedFields(verifyData?.application_data),
        })
      }

      if (error) {
        return { success: false, error: `Failed to update progress: ${error.message}` }
      }

      return { success: true, applicationId: data?.[0]?.id }
    } else {
      const { data, error } = await supabase
        .from("application_progress")
        .upsert(
          {
            user_id: user.id,
            application_type: applicationType,
            application_data: dataToStore,
            current_step: currentStep,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,application_type",
          },
        )
        .select()

      console.log("[v0] SAVE DEBUG - Upsert result:", {
        success: !error,
        error: error?.message,
        dataReturned: !!data?.[0],
        applicationId: data?.[0]?.id,
      })

      if (!error && data?.[0]) {
        const { data: verifyData, error: verifyError } = await supabase
          .from("application_progress")
          .select("application_data, current_step")
          .eq("id", data[0].id)
          .single()

        console.log("[v0] SAVE DEBUG - Database verification after upsert:", {
          verifySuccess: !verifyError,
          verifyError: verifyError?.message,
          hasDataInDB: !!verifyData?.application_data,
          currentStepInDB: verifyData?.current_step,
          dataTypeInDB: typeof verifyData?.application_data,
          hasEncryptedFieldsInDB: hasEncryptedFields(verifyData?.application_data),
        })
      }

      if (error) {
        return { success: false, error: `Failed to save progress: ${error.message}` }
      }

      return { success: true, applicationId: data?.[0]?.id }
    }
  } catch (error) {
    console.error("[v0] SAVE DEBUG - Error occurred:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    })
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
      let applicationData

      console.log("[v0] LOAD DEBUG - Raw data from DB:", {
        hasData: !!data[0].application_data,
        dataType: typeof data[0].application_data,
        isString: typeof data[0].application_data === "string",
        hasRootIvEncrypted:
          data[0].application_data && typeof data[0].application_data === "object" && "iv" in data[0].application_data,
        hasNestedEncryption: hasEncryptedFields(data[0].application_data),
        personalInfoStructure: data[0].application_data?.personalInfo
          ? Object.keys(data[0].application_data.personalInfo)
          : [],
        firstNameValue: data[0].application_data?.personalInfo?.firstName,
      })

      if (!process.env.PHI_ENCRYPTION_KEY) {
        throw new Error("PHI_ENCRYPTION_KEY environment variable is required for HIPAA compliance")
      }

      if (typeof data[0].application_data === "string") {
        try {
          console.log("[v0] LOAD DEBUG - Attempting to decrypt string data")
          applicationData = await decryptApplicationData(data[0].application_data)
          console.log("[v0] LOAD DEBUG - String decryption successful")
        } catch (decryptError) {
          console.error("[v0] LOAD DEBUG - String decryption failed:", decryptError)
          return { data: null }
        }
      } else if (typeof data[0].application_data === "object" && data[0].application_data !== null) {
        const rawData = data[0].application_data

        if (hasEncryptedFields(rawData)) {
          try {
            console.log("[v0] LOAD DEBUG - Attempting to decrypt object with nested encrypted fields")
            applicationData = await decryptApplicationData(rawData)
            console.log("[v0] LOAD DEBUG - Nested decryption successful")
          } catch (decryptError) {
            console.error("[v0] LOAD DEBUG - Nested decryption failed:", decryptError)
            return { data: null }
          }
        } else if ("iv" in rawData && "encrypted" in rawData) {
          try {
            console.log("[v0] LOAD DEBUG - Attempting to decrypt object with root iv/encrypted")
            applicationData = await decryptApplicationData(rawData)
            console.log("[v0] LOAD DEBUG - Root object decryption successful")
          } catch (decryptError) {
            console.error("[v0] LOAD DEBUG - Root object decryption failed:", decryptError)
            return { data: null }
          }
        } else {
          console.log("[v0] LOAD DEBUG - Using raw object data (no encryption detected)")
          applicationData = rawData
        }
      } else {
        console.log("[v0] LOAD DEBUG - No application data found")
        return { data: null }
      }

      console.log("[v0] LOAD DEBUG - After decryption:", {
        hasData: !!applicationData,
        type: typeof applicationData,
        hasPersonalInfo: !!applicationData?.personalInfo,
        personalInfoFirstName: applicationData?.personalInfo?.firstName,
        hasBenefitType: !!applicationData?.benefitType,
        hasState: !!applicationData?.state,
      })

      const benefitTypeFromData = applicationData?.benefitType
      const benefitTypeFromDB = data[0].application_type
      const finalBenefitType = benefitTypeFromData || benefitTypeFromDB || ""

      const defaultApplicationData = {
        benefitType: "",
        state: "",
        personalInfo: {
          applyingFor: "",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          languagePreference: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
          },
          phone: "",
          email: "",
          citizenshipStatus: "",
          socialSecurityNumber: "",
        },
        householdMembers: [],
        householdQuestions: {
          appliedWithDifferentInfo: "",
          appliedWithDifferentInfoMembers: [],
          appliedInOtherState: "",
          appliedInOtherStateMembers: [],
          receivedBenefitsBefore: "",
          receivedBenefitsBeforeMembers: [],
          receivingSNAPThisMonth: "",
          receivingSNAPThisMonthMembers: [],
          disqualifiedFromBenefits: "",
          disqualifiedFromBenefitsMembers: [],
          wantSomeoneElseToReceiveSNAP: "",
          wantSomeoneElseToReceiveSNAPMembers: [],
        },
        incomeEmployment: {
          employment: [],
          income: [],
          expenses: [],
          taxFilingStatus: "",
        },
        assets: {
          assets: [],
        },
        healthDisability: {
          healthInsurance: [],
          disabilities: { hasDisabled: false },
          pregnancyInfo: { isPregnant: false },
          medicalConditions: { hasChronicConditions: false },
          medicalBills: { hasRecentBills: false },
          needsNursingServices: "",
        },
        additionalInfo: {
          additionalInfo: "",
        },
      }

      const safeApplicationData = {
        ...defaultApplicationData,
        ...applicationData,
        benefitType: finalBenefitType,
        personalInfo: {
          ...defaultApplicationData.personalInfo,
          ...applicationData?.personalInfo,
          address: {
            ...defaultApplicationData.personalInfo.address,
            ...applicationData?.personalInfo?.address,
          },
        },
        householdQuestions: {
          ...defaultApplicationData.householdQuestions,
          ...applicationData?.householdQuestions,
        },
        incomeEmployment: {
          ...defaultApplicationData.incomeEmployment,
          ...applicationData?.incomeEmployment,
        },
        assets: {
          ...defaultApplicationData.assets,
          ...applicationData?.assets,
        },
        healthDisability: {
          ...defaultApplicationData.healthDisability,
          ...applicationData?.healthDisability,
        },
        additionalInfo: {
          ...defaultApplicationData.additionalInfo,
          ...applicationData?.additionalInfo,
        },
      }

      return {
        data: {
          applicationData: safeApplicationData,
          currentStep: data[0].current_step,
          applicationId: data[0].id,
        },
      }
    }

    return { data: null }
  } catch (error) {
    console.error("[v0] Load application progress error:", error)
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

    if (applicationId) {
      query = query.eq("id", applicationId)
    } else if (applicationType) {
      query = query.eq("application_type", applicationType)
    } else {
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

    const encryptedApplicationData = await encryptApplicationData(applicationData)

    const { data: submittedApplication, error: submitError } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        benefit_type: benefitType,
        application_data: encryptedApplicationData,
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
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: [] }
    }

    const { data: applications, error } = await supabase
      .from("applications")
      .select("id, benefit_type, submitted_at, status")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching submitted applications:", error)
      return { data: [] }
    }

    return { data: applications || [] }
  } catch (error) {
    console.error("Error in getSubmittedApplications:", error)
    return { data: [] }
  }
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

export async function loadAllUserApplications() {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: [] }
    }

    const { data, error } = await supabase
      .from("application_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error || !data) {
      return { data: [] }
    }

    const processedApplications = []

    for (const app of data) {
      let applicationData

      if (!process.env.PHI_ENCRYPTION_KEY) {
        throw new Error("PHI_ENCRYPTION_KEY environment variable is required for HIPAA compliance")
      }

      if (typeof app.application_data === "string") {
        try {
          applicationData = await decryptApplicationData(app.application_data)
        } catch (decryptError) {
          console.error("Failed to decrypt application data:", decryptError)
          continue
        }
      } else if (typeof app.application_data === "object" && app.application_data !== null) {
        const rawData = app.application_data

        if (hasEncryptedFields(rawData)) {
          try {
            applicationData = await decryptApplicationData(rawData)
          } catch (decryptError) {
            console.error("Failed to decrypt nested application data:", decryptError)
            continue
          }
        } else if ("iv" in rawData && "encrypted" in rawData) {
          try {
            applicationData = await decryptApplicationData(rawData)
          } catch (decryptError) {
            console.error("Failed to decrypt root application data:", decryptError)
            continue
          }
        } else {
          applicationData = rawData
        }
      } else {
        continue
      }

      const benefitTypeFromData = applicationData?.benefitType
      const benefitTypeFromDB = app.application_type
      const finalBenefitType = benefitTypeFromData || benefitTypeFromDB || ""

      processedApplications.push({
        id: app.id,
        application_data: applicationData,
        current_step: app.current_step,
        application_type: app.application_type,
        benefit_type: finalBenefitType,
        created_at: app.created_at,
        updated_at: app.updated_at,
      })
    }

    return { data: processedApplications }
  } catch (error) {
    console.error("Load all user applications error:", error)
    return { data: [] }
  }
}
