"use client"

import { Suspense } from "react"
import { ApplicationPageClient } from "@/components/application-page-client"
import { useTranslation } from "@/contexts/translation-context"

export default function ApplicationPage() {
  const { t } = useTranslation()

  return (
    <Suspense fallback={<div>{t("common.loading")}</div>}>
      <ApplicationPageClient />
    </Suspense>
  )
}
