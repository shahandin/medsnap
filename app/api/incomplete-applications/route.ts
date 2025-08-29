import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] API: Loading incomplete applications...")
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] API: No user found or auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Query application_progress for incomplete applications
    const { data, error } = await supabase
      .from("application_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("[v0] API: Error loading incomplete applications:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    console.log("[v0] API: Found incomplete applications:", data?.length || 0)
    return NextResponse.json({ applications: data || [] })
  } catch (error) {
    console.error("[v0] API: Error in GET /api/incomplete-applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
