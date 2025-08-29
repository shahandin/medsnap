import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    console.log("[v0] Auth check - Access token exists:", !!accessToken)

    if (!accessToken) {
      console.log("[v0] Auth check - No access token found")
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log("[v0] Auth check - Making request to Supabase user endpoint")

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    })

    console.log("[v0] Auth check - Supabase response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Auth check - Supabase error:", errorText)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await response.json()
    console.log("[v0] Auth check - User found:", !!user)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Auth verification error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
