import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { responses, medicaid_eligible, snap_eligible } = body

    const { data, error } = await supabase.from("prescreening_completion").upsert(
      {
        user_id: user.id,
        responses,
        medicaid_eligible,
        snap_eligible,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) {
      console.error("Error saving prescreening:", error)
      return NextResponse.json({ error: "Failed to save prescreening" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in prescreening API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Checking prescreening for user:", user.id)

    const { data, error } = await supabase.from("prescreening_completion").select("*").eq("user_id", user.id).single()

    console.log("[v0] Database query result:", { data, error })

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error checking prescreening:", error)
      return NextResponse.json({ error: "Failed to check prescreening" }, { status: 500 })
    }

    const result = {
      completed: !!data,
      data: data || null,
    }

    console.log("[v0] Returning prescreening status:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in prescreening GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
