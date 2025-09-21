import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AboutPageClient } from "@/components/about-page-client"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />
      <AboutPageClient user={user} />
      <SiteFooter />
    </div>
  )
}
