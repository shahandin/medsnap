import { cookies } from "next/headers"

export async function getServerUser() {
  try {
    console.log("[v0] getServerUser: Starting server-side auth check...")

    const cookieStore = cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    console.log("[v0] getServerUser: Access token found:", !!accessToken)

    if (!accessToken) {
      console.log("[v0] getServerUser: No access token, returning null")
      return null
    }

    // Validate token with Supabase API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
    })

    console.log("[v0] getServerUser: Supabase API response status:", response.status)

    if (response.ok) {
      const user = await response.json()
      console.log("[v0] getServerUser: User authenticated:", { id: user.id, email: user.email })
      return user
    } else {
      console.log("[v0] getServerUser: Token validation failed")
      return null
    }
  } catch (error) {
    console.log("[v0] getServerUser: Error during auth check:", error)
    return null
  }
}
