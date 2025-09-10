import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PrescreeningClient } from "@/components/prescreening-client"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PrescreeningPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-up")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <PrescreeningClient />
      </main>

      <SiteFooter />
    </div>
  )
}
