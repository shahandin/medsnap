"use client"

import LoginForm from "@/components/login-form"
import { useTranslation } from "@/contexts/translation-context"

export default function SignInPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}
