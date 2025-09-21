import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { HomePageContent } from "@/components/home-page-content"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = await createClient()

  let user = null
  if (supabase) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />
      <HomePageContent />
      <SiteFooter />
    </div>
  )
}
