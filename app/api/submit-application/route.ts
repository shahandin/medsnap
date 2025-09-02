import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Submit API: Starting submission process")

    const { applicationData, benefitType } = await request.json()
    console.log("[v0] Submit API: Received data - benefitType:", benefitType)

    const supabase = createClient()
    console.log("[v0] Submit API: Created Supabase client")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Submit API: Auth check - user:", user ? "found" : "null", "error:", authError)

    if (authError || !user) {
      console.log("[v0] Submit API: Authentication failed, returning 401")
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: {
            step: "authentication",
            message: "User authentication failed",
            authError: authError?.message,
            hasUser: !!user,
          },
        },
        { status: 401 },
      )
    }

    console.log("[v0] Submit API: Attempting database insert for user:", user.id)

    // Insert the application into the database
    const { data: application, error: insertError } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        application_data: applicationData,
        benefit_type: benefitType,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Submit API: Database insert error:", insertError)
      console.error("[v0] Submit API: Insert error details:", JSON.stringify(insertError, null, 2))
      return NextResponse.json(
        {
          error: "Failed to submit application. Please try again.",
          details: {
            step: "database_insert",
            message: "Failed to insert application into database",
            dbError: insertError.message,
            dbCode: insertError.code,
            dbDetails: insertError.details,
          },
        },
        { status: 500 },
      )
    }

    console.log("[v0] Submit API: Application inserted successfully, ID:", application.id)

    // Delete any incomplete applications for this user and benefit type
    console.log("[v0] Submit API: Cleaning up incomplete applications")
    const { error: deleteError } = await supabase
      .from("incomplete_applications")
      .delete()
      .eq("user_id", user.id)
      .eq("benefit_type", benefitType)

    if (deleteError) {
      console.error("[v0] Submit API: Delete error (non-critical):", deleteError)
    }

    console.log("[v0] Submit API: Submission completed successfully")
    return NextResponse.json({
      success: true,
      applicationId: application.id,
    })
  } catch (error) {
    console.error("[v0] Submit API: Unexpected error:", error)
    console.error("[v0] Submit API: Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Submit API: Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again.",
        details: {
          step: "unexpected_error",
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          errorType: typeof error,
        },
      },
      { status: 500 },
    )
  }
}
