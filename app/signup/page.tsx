"use client"

import { Suspense } from "react"
import { SignUpForm } from "@/components/sign-up-form"
import { useTranslation } from "@/contexts/translation-context"

export default function SignUpPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div>{t("common.loading")}</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
