"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, ArrowRight } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context"

interface IncompleteApplication {
  id: string
  current_step: number
  application_data: any
  updated_at: string
  application_type?: string
  benefit_type?: string
}

export default function ApplicationChoiceClient() {
  const { t } = useTranslation()
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
      const response = await fetch("/api/incomplete-applications")

      if (response.status === 401) {
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

      const applications = data.applications || []

      setIncompleteApplications(applications)
    } catch (error) {
      console.error("Error loading incomplete applications:", error)
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
        const submittedIds = data.applications?.map((app: any) => app.application_progress_id).filter(Boolean) || []
        setSubmittedApplications(submittedIds)
      }
    } catch (error) {}
  }

  const startNewApplication = () => {
    router.push("/application?fresh=true")
  }

  const continueApplication = (applicationId: string) => {
    router.push(`/application?continue=${applicationId}`)
  }

  const getStepName = (step: number) => {
    const stepKeys = [
      "forms.review.sections.personalInfo", // Benefit Selection -> Personal Info for translation consistency
      "forms.review.sections.personalInfo",
      "forms.review.sections.household",
      "forms.review.sections.income",
      "forms.review.sections.assets",
      "forms.review.sections.health",
      "Additional Information", // Keep as fallback for now
      "forms.review.title",
    ]
    return stepKeys[step] ? t(stepKeys[step]) : `Step ${step + 1}`
  }

  const getBenefitType = (application: IncompleteApplication) => {
    const benefitType =
      application.application_type ||
      application.application_data?.benefitType ||
      application.application_data?.benefitSelection?.selectedBenefits?.[0]

    switch (benefitType) {
      case "medicaid":
        return t("applicationChoice.medicaidApplication")
      case "snap":
        return t("applicationChoice.snapApplication")
      case "both":
        return t("applicationChoice.bothApplication")
      default:
        return t("applicationChoice.benefitsApplication")
    }
  }

  const getBenefitTypeColor = (application: IncompleteApplication) => {
    const benefitType = application.application_type || application.application_data?.benefitType

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

  const getStartedBenefitTypes = () => {
    const incompleteTypes = incompleteApplications.map((app) => {
      return (
        app.application_type ||
        app.application_data?.benefitType ||
        app.application_data?.benefitSelection?.selectedBenefits?.[0] ||
        "unknown"
      )
    })

    return [...new Set([...incompleteTypes, ...submittedApplications])]
  }

  const canStartNew = () => {
    const startedTypes = getStartedBenefitTypes()

    if (startedTypes.includes("both")) {
      return false
    }

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
          <p className="text-gray-600">{t("applicationChoice.loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{t("common.tryAgain")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("applicationChoice.title")}</h1>
          <p className="text-gray-600">{t("applicationChoice.subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {canStartNew() && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={startNewApplication}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{t("applicationChoice.startNew.title")}</CardTitle>
                <CardDescription>{t("applicationChoice.startNew.description")}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" size="lg">
                  {t("applicationChoice.startNew.button")} <ArrowRight className="ml-2 w-4 h-4" />
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
              <CardTitle className="text-xl">{t("applicationChoice.continueExisting.title")}</CardTitle>
              <CardDescription>{t("applicationChoice.continueExisting.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {incompleteApplications.filter((app) => !submittedApplications.includes(app.id)).length > 0 ? (
                <div className="space-y-3">
                  {incompleteApplications
                    .filter((app) => !submittedApplications.includes(app.id))
                    .map((app) => {
                      return (
                        <div
                          key={app.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => continueApplication(app.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="mb-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBenefitTypeColor(app)}`}
                                >
                                  {getBenefitType(app)}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                  {t("applicationChoice.continueExisting.lastSaved")}{" "}
                                  {new Date(app.updated_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-blue-600 font-medium">
                                  {t("applicationChoice.continueExisting.currentStep")} {getStepName(app.current_step)}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-4">{t("applicationChoice.continueExisting.noApplications")}</p>
                  <Button variant="outline" disabled className="w-full bg-transparent">
                    {t("applicationChoice.continueExisting.noApplicationsButton")}
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
