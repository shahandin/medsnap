import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { HomePageContent } from "@/components/home-page-content"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />
      <HomePageContent />
      <SiteFooter />
    </div>
  )
}
