import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import BenefitsApplicationClient from "@/components/benefits-application-client"

export const dynamic = "force-dynamic"

export default async function ApplicationPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />
      <main className="flex-1">
        <BenefitsApplicationClient />
      </main>
      <SiteFooter />
    </div>
  )
}
