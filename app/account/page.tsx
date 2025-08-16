import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import AccountDashboardClient from "@/components/account-dashboard-client"

export const dynamic = "force-dynamic"

export default async function AccountPage() {
  // Check if user is authenticated
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not authenticated, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />
      <main className="flex-1">
        <AccountDashboardClient user={user} />
      </main>
      <SiteFooter />
    </div>
  )
}
