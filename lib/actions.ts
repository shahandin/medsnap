"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { encryptApplicationData, decryptApplicationData } from "@/lib/hipaa-encryption"

export async function saveApplicationProgress(applicationData: any, currentStep: number, applicationId?: string) {
  console.log("[v0] saveApplicationProgress called with:", {
    hasApplicationData: !!applicationData,
    currentStep,
    applicationId,
    benefitType: applicationData?.benefitType,
  })

  console.log("[v0] Application data details:", {
    applicationDataType: typeof applicationData,
    applicationDataKeys: applicationData ? Object.keys(applicationData) : [],
    applicationDataStringified: JSON.stringify(applicationData, null, 2),
    applicationDataLength: applicationData ? JSON.stringify(applicationData).length : 0,
  })

  console.log("[v0] Comprehensive environment check:", {
    hasPHIKey: !!process.env.PHI_ENCRYPTION_KEY,
    keyLength: process.env.PHI_ENCRYPTION_KEY?.length || 0,
    keyPreview: process.env.PHI_ENCRYPTION_KEY ? process.env.PHI_ENCRYPTION_KEY.substring(0, 8) + "..." : "undefined",
    allEnvKeys: Object.keys(process.env).filter((key) => key.includes("PHI") || key.includes("ENCRYPTION")),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    totalEnvVars: Object.keys(process.env).length,
    // Check if any Supabase env vars are working
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    // Check all env vars starting with common prefixes
    envVarsStartingWithP: Object.keys(process.env).filter((key) => key.startsWith("P")),
    envVarsContainingKey: Object.keys(process.env).filter((key) => key.toLowerCase().includes("key")),
    // Raw access attempt
    rawPHIKey: process.env["PHI_ENCRYPTION_KEY"],
    // Alternative access methods
    altAccess1: process.env.PHI_ENCRYPTION_KEY,
    altAccess2: globalThis.process?.env?.PHI_ENCRYPTION_KEY,
  })

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check:", { hasUser: !!user, authError })

    if (authError || !user) {
      console.log("[v0] Authentication failed")
      return { success: false, error: "Not authenticated" }
    }

    const benefitType = applicationData?.benefitType || ""
    console.log("[v0] Benefit type:", benefitType)

    // Only save if benefit type is selected (after Step 0)
    if (!benefitType || benefitType === "") {
      console.log("[v0] No benefit type selected, skipping save")
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
      console.log("[v0] Invalid benefit type:", benefitType)
      return { success: false, error: "Invalid benefit type" }
    }

    console.log("[v0] Application type mapped to:", applicationType)

    if (!process.env.PHI_ENCRYPTION_KEY) {
      console.log("[v0] Missing PHI_ENCRYPTION_KEY")
      throw new Error("PHI_ENCRYPTION_KEY environment variable is required for HIPAA compliance")
    }

    console.log("[v0] Starting encryption...")
    const dataToStore = await encryptApplicationData(applicationData)
    console.log("[v0] Encryption completed, data length:", JSON.stringify(dataToStore).length)

    if (applicationId) {
      console.log("[v0] Updating existing application:", applicationId)
      const { data, error } = await supabase
        .from("application_progress")
        .update({
          application_data: dataToStore, // Use validated data
          current_step: currentStep,
          application_type: applicationType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("user_id", user.id)
        .select()

      console.log("[v0] Update result:", { hasData: !!data, error })

      if (error) {
        console.log("[v0] Update failed:", error.message)
        return { success: false, error: `Failed to update progress: ${error.message}` }
      }

      console.log("[v0] Update successful")
      return { success: true, applicationId: data?.[0]?.id }
    } else {
      console.log("[v0] Creating new application record")
      const { data, error } = await supabase
        .from("application_progress")
        .upsert(
          {
            user_id: user.id,
            application_type: applicationType,
            application_data: dataToStore, // Use validated data
            current_step: currentStep,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,application_type",
          },
        )
        .select()

      console.log("[v0] Upsert result:", { hasData: !!data, dataLength: data?.length, error })

      if (error) {
        console.log("[v0] Upsert failed:", error.message)
        return { success: false, error: `Failed to save progress: ${error.message}` }
      }

      console.log("[v0] Upsert successful, applicationId:", data?.[0]?.id)
      return { success: true, applicationId: data?.[0]?.id }
    }
  } catch (error) {
    console.log("[v0] saveApplicationProgress error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadApplicationProgress(applicationId?: string) {
  try {
    console.log("[v0] loadApplicationProgress called with applicationId:", applicationId)

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth failed in loadApplicationProgress")
      return { data: null }
    }

    console.log("[v0] User authenticated, querying database...")

    let query = supabase.from("application_progress").select("*")

    if (applicationId) {
      query = query.eq("id", applicationId)
    } else {
      query = query.eq("user_id", user.id).order("updated_at", { ascending: false })
    }

    const { data, error } = await query.limit(1)

    console.log("[v0] Database query result:", {
      hasData: !!data,
      dataLength: data?.length,
      error,
      rawApplicationData: data?.[0]?.application_data ? "present" : "missing",
      applicationType: data?.[0]?.application_type,
      rawDataType: typeof data?.[0]?.application_data,
      rawDataKeys:
        data?.[0]?.application_data && typeof data?.[0]?.application_data === "object"
          ? Object.keys(data[0].application_data)
          : "not an object",
      rawDataSample:
        data?.[0]?.application_data && typeof data?.[0]?.application_data === "object"
          ? JSON.stringify(data[0].application_data).substring(0, 200) + "..."
          : data?.[0]?.application_data,
    })

    if (!error && data && data.length > 0) {
      let applicationData

      if (!process.env.PHI_ENCRYPTION_KEY) {
        throw new Error("PHI_ENCRYPTION_KEY environment variable is required for HIPAA compliance")
      }

      console.log("[v0] Processing application data, type:", typeof data[0].application_data)

      if (typeof data[0].application_data === "string") {
        console.log("[v0] Decrypting application data...")
        try {
          applicationData = await decryptApplicationData(data[0].application_data)
          console.log("[v0] Decryption successful:", {
            hasData: !!applicationData,
            dataType: typeof applicationData,
            benefitType: applicationData?.benefitType,
            dataKeys: applicationData ? Object.keys(applicationData) : [],
            isValidObject: applicationData && typeof applicationData === "object" && !Array.isArray(applicationData),
          })
        } catch (decryptError) {
          console.error("[v0] Decryption failed:", decryptError)
          console.log("[v0] Decryption error details:", {
            errorMessage: decryptError instanceof Error ? decryptError.message : "Unknown error",
            errorType: typeof decryptError,
            inputDataType: typeof data[0].application_data,
            inputDataLength: data[0].application_data?.length,
          })
          return { data: null }
        }
      } else if (typeof data[0].application_data === "object" && data[0].application_data !== null) {
        console.log("[v0] Processing object data - checking for encrypted fields...")
        const rawData = data[0].application_data
        console.log("[v0] Object data analysis:", {
          hasIvField: "iv" in rawData,
          hasEncryptedField: "encrypted" in rawData,
          objectKeys: Object.keys(rawData),
          isEncryptedObject: "iv" in rawData && "encrypted" in rawData,
        })

        if ("iv" in rawData && "encrypted" in rawData) {
          console.log("[v0] Found encrypted object in database, attempting to decrypt...")
          try {
            applicationData = await decryptApplicationData(rawData)
            console.log("[v0] Successfully decrypted object data:", {
              hasData: !!applicationData,
              dataType: typeof applicationData,
              benefitType: applicationData?.benefitType,
            })
          } catch (decryptError) {
            console.error("[v0] Failed to decrypt object data:", decryptError)
            return { data: null }
          }
        } else {
          console.log("[v0] Using unencrypted legacy data")
          applicationData = rawData
        }
      } else {
        console.log("[v0] Application data is null or invalid")
        return { data: null }
      }

      if (!applicationData || typeof applicationData !== "object" || Array.isArray(applicationData)) {
        console.error("[v0] Invalid application data after processing:", {
          hasData: !!applicationData,
          dataType: typeof applicationData,
          isArray: Array.isArray(applicationData),
        })
        return { data: null }
      }

      const checkForEncryptedObjects = (obj: any, path = ""): string[] => {
        const encryptedPaths: string[] = []
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          if ("iv" in obj && "encrypted" in obj) {
            encryptedPaths.push(path || "root")
          }
          for (const [key, value] of Object.entries(obj)) {
            encryptedPaths.push(...checkForEncryptedObjects(value, path ? `${path}.${key}` : key))
          }
        }
        return encryptedPaths
      }

      const encryptedPaths = checkForEncryptedObjects(applicationData)
      if (encryptedPaths.length > 0) {
        console.error("[v0] Found encrypted objects in decrypted data at paths:", encryptedPaths)
        console.log("[v0] This will cause React rendering errors!")
      }

      const benefitTypeFromData = applicationData?.benefitType
      const benefitTypeFromDB = data[0].application_type
      const finalBenefitType = benefitTypeFromData || benefitTypeFromDB || ""

      console.log("[v0] Benefit type resolution:", {
        fromData: benefitTypeFromData,
        fromDB: benefitTypeFromDB,
        final: finalBenefitType,
      })

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
          disabilities: { hasDisabled: "" },
          pregnancyInfo: { isPregnant: "" },
          medicalConditions: { hasChronicConditions: "" },
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

      console.log("[v0] Final safe application data:", {
        benefitType: safeApplicationData.benefitType,
        currentStep: data[0].current_step,
        applicationId: data[0].id,
      })

      return {
        data: {
          applicationData: safeApplicationData,
          currentStep: data[0].current_step,
          applicationId: data[0].id,
        },
      }
    }

    console.log("[v0] No application data found")
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
