import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: submissions, error } = await supabase
      .from("applications")
      .select("benefit_type, submitted_at, status")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching submitted applications:", error)
      return NextResponse.json({ error: "Failed to fetch submitted applications" }, { status: 500 })
    }

    // Return the submitted applications
    const applications = submissions || []

    return NextResponse.json({
      applications,
      success: true,
    })
  } catch (error) {
    console.error("Error in submitted-applications API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
