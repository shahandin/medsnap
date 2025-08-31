import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Submit application request received...")
    const { applicationData, benefitType } = await request.json()

    const supabase = createClient()
    console.log("[v0] API: Checking authentication...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] API: Auth result - User:", user ? "found" : "not found", "Error:", authError)

    if (authError || !user) {
      console.log("[v0] API: Authentication failed, returning 401")
      return NextResponse.json(
        { error: "You must be logged in to submit an application. Please sign in and try again." },
        { status: 401 },
      )
    }

    console.log("[v0] API: User authenticated, proceeding with submission...")

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
      console.error("Database error:", insertError)
      return NextResponse.json({ error: "Failed to submit application. Please try again." }, { status: 500 })
    }

    // Delete any incomplete applications for this user and benefit type
    await supabase.from("incomplete_applications").delete().eq("user_id", user.id).eq("benefit_type", benefitType)

    return NextResponse.json({
      success: true,
      applicationId: application.id,
    })
  } catch (error) {
    console.error("Submit application error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
