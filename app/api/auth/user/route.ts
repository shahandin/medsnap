import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Auth API: Starting user verification...")
    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    console.log("[v0] Auth API: Access token exists:", !!accessToken)
    if (accessToken) {
      console.log("[v0] Auth API: Token length:", accessToken.length)
      console.log("[v0] Auth API: Token preview:", accessToken.substring(0, 20) + "...")
    }

    if (!accessToken) {
      console.log("[v0] Auth API: No access token found, returning 401")
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log("[v0] Auth API: Supabase URL configured:", !!supabaseUrl)
    console.log("[v0] Auth API: Making request to:", `${supabaseUrl}/auth/v1/user`)

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    })

    console.log("[v0] Auth API: Supabase response status:", response.status)
    console.log("[v0] Auth API: Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Auth API: Supabase error response:", errorText)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await response.json()
    console.log("[v0] Auth API: User data received:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
    })
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Auth API: Exception occurred:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
