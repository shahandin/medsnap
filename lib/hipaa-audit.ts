import { createClient } from "@/lib/supabase/server"

export interface AuditLogEntry {
  userId: string
  actionType: "CREATE" | "READ" | "UPDATE" | "DELETE"
  tableName: string
  recordId?: string
  phiFieldsAccessed?: string[]
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  success?: boolean
  errorMessage?: string
  additionalContext?: any
}

export async function logPHIAccess(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("hipaa_audit_log").insert({
      user_id: entry.userId,
      action_type: entry.actionType,
      table_name: entry.tableName,
      record_id: entry.recordId,
      phi_fields_accessed: entry.phiFieldsAccessed,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      session_id: entry.sessionId,
      success: entry.success ?? true,
      error_message: entry.errorMessage,
      additional_context: entry.additionalContext,
    })

    if (error) {
      console.error("[HIPAA Audit] Failed to log PHI access:", error)
    }
  } catch (error) {
    console.error("[HIPAA Audit] Error logging PHI access:", error)
  }
}

export async function logApplicationDataAccess(
  userId: string,
  actionType: "CREATE" | "READ" | "UPDATE" | "DELETE",
  applicationId?: string,
  phiFields?: string[],
  request?: Request,
): Promise<void> {
  const ipAddress = request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || "unknown"
  const userAgent = request?.headers.get("user-agent") || "unknown"

  await logPHIAccess({
    userId,
    actionType,
    tableName: "application_progress",
    recordId: applicationId,
    phiFieldsAccessed: phiFields,
    ipAddress,
    userAgent,
    additionalContext: {
      endpoint: request?.url,
      method: request?.method,
    },
  })
}

export function identifyPHIFields(applicationData: any): string[] {
  const phiFields: string[] = []

  if (applicationData.personalInfo) {
    const personalFields = Object.keys(applicationData.personalInfo)
    phiFields.push(...personalFields.map((f) => `personalInfo.${f}`))
  }

  if (applicationData.healthDisability) {
    const healthFields = Object.keys(applicationData.healthDisability)
    phiFields.push(...healthFields.map((f) => `healthDisability.${f}`))
  }

  if (applicationData.householdInfo?.members) {
    phiFields.push("householdInfo.members")
  }

  return phiFields
}
