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
  const router = useRouter()

  useEffect(() => {
    loadIncompleteApplications()
  }, [])

  const loadIncompleteApplications = async () => {
    try {
      console.log("[v0] Client: Loading incomplete applications...")
      const response = await fetch("/api/incomplete-applications")

      if (response.status === 401) {
        console.log("[v0] Client: Unauthorized, redirecting to login")
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
    if (applicationData?.benefitSelection?.selectedBenefits) {
      const benefits = applicationData.benefitSelection.selectedBenefits
      if (benefits.length > 0) {
        return benefits.join(", ")
      }
    }
    return "Application in Progress"
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
          {/* Start New Application */}
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

          {/* Continue Existing Application */}
          <Card
            className={`hover:shadow-lg transition-shadow ${incompleteApplications.length === 0 ? "opacity-50" : ""}`}
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
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => continueApplication(app.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{getBenefitType(app.application_data)}</p>
                          <p className="text-xs text-gray-500">
                            Last saved: {new Date(app.updated_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-blue-600">Current step: {getStepName(app.current_step)}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
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
