import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import ApplicationChoiceClient from "@/components/application-choice-client"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ApplicationChoicePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />

      <main className="flex-1">
        <ApplicationChoiceClient />
      </main>

      <SiteFooter />
    </div>
  )
}
