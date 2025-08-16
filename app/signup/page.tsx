"use client"

import { Suspense } from "react"
import { SignUpForm } from "@/components/sign-up-form"

export const dynamic = "force-dynamic"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-600">Start your benefits application</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  )
}
