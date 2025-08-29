import { Suspense } from "react"
import { ApplicationPageClient } from "@/components/application-page-client"

export default function ApplicationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationPageClient />
    </Suspense>
  )
}
