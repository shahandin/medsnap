import { cookies } from "next/headers"

export async function getServerUser() {
  try {
    console.log("[v0] getServerUser: Starting server-side auth check...")

    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    console.log(
      "[v0] getServerUser: All available cookies:",
      allCookies.map((c) => ({ name: c.name, hasValue: !!c.value, valueLength: c.value?.length || 0 })),
    )

    const accessToken = cookieStore.get("sb-access-token")?.value

    console.log("[v0] getServerUser: Access token found:", !!accessToken)
    if (accessToken) {
      console.log("[v0] getServerUser: Token preview:", accessToken.substring(0, 20) + "...")
      console.log("[v0] getServerUser: Token length:", accessToken.length)
    }

    if (!accessToken) {
      console.log("[v0] getServerUser: No access token, returning null")
      return null
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    console.log("[v0] getServerUser: Environment check - URL exists:", !!supabaseUrl, "Key exists:", !!supabaseKey)

    if (!supabaseUrl || !supabaseKey) {
      console.log("[v0] getServerUser: Missing environment variables")
      return null
    }

    // Validate token with Supabase API
    console.log("[v0] getServerUser: Making API request to:", `${supabaseUrl}/auth/v1/user`)
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseKey,
      },
    })

    console.log("[v0] getServerUser: Supabase API response status:", response.status)
    console.log("[v0] getServerUser: Response headers:", Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const user = await response.json()
      console.log("[v0] getServerUser: User authenticated successfully")
      console.log("[v0] getServerUser: User ID:", user.id)
      console.log("[v0] getServerUser: User email:", user.email)
      if (user.iat) {
        const issuedAt = new Date(user.iat * 1000)
        const expiresAt = user.exp ? new Date(user.exp * 1000) : null
        const now = new Date()
        console.log("[v0] getServerUser: Token issued at:", issuedAt.toISOString())
        console.log("[v0] getServerUser: Token expires at:", expiresAt?.toISOString() || "unknown")
        console.log("[v0] getServerUser: Current time:", now.toISOString())
        console.log("[v0] getServerUser: Token expired:", expiresAt ? now > expiresAt : "unknown")
      }
      return user
    } else {
      const errorText = await response.text()
      console.log("[v0] getServerUser: Token validation failed:", errorText)
      if (response.status === 401) {
        console.log("[v0] getServerUser: Token is invalid or expired")
      } else if (response.status === 403) {
        console.log("[v0] getServerUser: Token lacks required permissions")
      }
      return null
    }
  } catch (error) {
    console.log("[v0] getServerUser: Error during auth check:", error)
    if (error instanceof Error) {
      console.log("[v0] getServerUser: Error name:", error.name)
      console.log("[v0] getServerUser: Error message:", error.message)
    }
    return null
  }
}
