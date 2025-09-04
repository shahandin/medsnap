"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, ArrowRight } from "lucide-react"

interface IncompleteApplication {
  id: string
  current_step: number
  application_data: any
  updated_at: string
  benefit_type?: string
}

export default function ApplicationChoiceClient() {
  const [incompleteApplications, setIncompleteApplications] = useState<IncompleteApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submittedApplications, setSubmittedApplications] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    loadIncompleteApplications()
    loadSubmittedApplications()
  }, [])

  const loadIncompleteApplications = async () => {
    try {
      console.log("[v0] Client: Loading incomplete applications...")
      console.log("[v0] Client: Current URL:", window.location.href)
      console.log("[v0] Client: Checking authentication status...")

      const response = await fetch("/api/incomplete-applications")

      if (response.status === 401) {
        console.log("[v0] Client: Unauthorized - user not signed in, redirecting to sign-up")
        router.push("/auth/sign-up")
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      console.log("[v0] Client: Found incomplete applications:", data.applications?.length || 0)
      setIncompleteApplications(data.applications || [])
    } catch (error) {
      console.error("[v0] Client: Error loading incomplete applications:", error)
      setError("Failed to load applications. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadSubmittedApplications = async () => {
    try {
      const response = await fetch("/api/submitted-applications")
      if (response.ok) {
        const data = await response.json()
        const benefitTypes = data.applications?.map((app: any) => app.benefit_type) || []
        setSubmittedApplications(benefitTypes)
      }
    } catch (error) {}
  }

  const startNewApplication = () => {
    console.log("[v0] Starting new application")
    router.push("/application?fresh=true")
  }

  const continueApplication = (applicationId: string) => {
    console.log("[v0] Continuing application:", applicationId)
    router.push(`/application?continue=${applicationId}`)
  }

  const getStepName = (step: number) => {
    const stepNames = [
      "Benefit Selection",
      "Personal Information",
      "Household Information",
      "Income Information",
      "Asset Information",
      "Health & Disability",
      "Additional Information",
      "Review & Submit",
    ]
    return stepNames[step] || `Step ${step + 1}`
  }

  const getBenefitType = (applicationData: any) => {
    if (applicationData?.benefitType) {
      const benefitType = applicationData.benefitType
      switch (benefitType) {
        case "medicaid":
          return "Medicaid Application"
        case "snap":
          return "SNAP Application"
        case "both":
          return "Medicaid & SNAP Application"
        default:
          return `${benefitType} Application`
      }
    }

    // Fallback to old logic for backward compatibility
    if (applicationData?.benefitSelection?.selectedBenefits) {
      const benefits = applicationData.benefitSelection.selectedBenefits
      if (benefits.length > 0) {
        return `${benefits.join(" & ")} Application`
      }
    }

    return "Benefits Application"
  }

  const getBenefitTypeColor = (applicationData: any) => {
    if (applicationData?.benefitType) {
      const benefitType = applicationData.benefitType
      switch (benefitType) {
        case "medicaid":
          return "bg-green-100 text-green-800"
        case "snap":
          return "bg-blue-100 text-blue-800"
        case "both":
          return "bg-purple-100 text-purple-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }
    return "bg-gray-100 text-gray-800"
  }

  const getStartedBenefitTypes = () => {
    const incompleteTypes = incompleteApplications.map((app) => {
      const benefitType =
        app.application_data?.benefitType || app.application_data?.benefitSelection?.selectedBenefits?.[0] || "unknown"
      return benefitType
    })

    return [...new Set([...incompleteTypes, ...submittedApplications])]
  }

  const canStartNew = () => {
    const startedTypes = getStartedBenefitTypes()

    // If user has started or submitted "both", they can't start anything new
    if (startedTypes.includes("both")) {
      return false
    }

    // If user has started or submitted both "medicaid" and "snap", they can't start anything new
    if (startedTypes.includes("medicaid") && startedTypes.includes("snap")) {
      return false
    }

    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Applications</h1>
          <p className="text-gray-600">Choose how you'd like to proceed with your benefits application</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {canStartNew() && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={startNewApplication}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Start New Application</CardTitle>
                <CardDescription>Begin a fresh benefits application from the beginning</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" size="lg">
                  Start New <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          <Card
            className={`hover:shadow-lg transition-shadow ${incompleteApplications.length === 0 ? "opacity-50" : ""} ${!canStartNew() ? "md:col-span-2" : ""}`}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Continue Existing</CardTitle>
              <CardDescription>Resume working on applications you've already started</CardDescription>
            </CardHeader>
            <CardContent>
              {incompleteApplications.length > 0 ? (
                <div className="space-y-3">
                  {incompleteApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => continueApplication(app.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="mb-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBenefitTypeColor(app.application_data)}`}
                            >
                              {getBenefitType(app.application_data)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              Last saved: {new Date(app.updated_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-blue-600 font-medium">
                              Current step: {getStepName(app.current_step)}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-4">No applications in progress</p>
                  <Button variant="outline" disabled className="w-full bg-transparent">
                    No Applications to Continue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
