import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import ApplicationChoiceClient from "@/components/application-choice-client"
import { getServerUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function ApplicationChoicePage() {
  const user = await getServerUser()

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
