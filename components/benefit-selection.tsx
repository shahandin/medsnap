"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/contexts/translation-context"

interface BenefitSelectionProps {
  selectedBenefits: string
  onBenefitSelect: (benefits: string) => void
  submittedApplications?: string[]
}

export function BenefitSelection({
  selectedBenefits,
  onBenefitSelect,
  submittedApplications = [],
}: BenefitSelectionProps) {
  const router = useRouter()
  const { t } = useTranslation()

  const BENEFIT_OPTIONS = [
    {
      id: "medicaid",
      title: t("benefitSelection.medicaidOnly"),
      description: t("benefitSelection.medicaidDescription"),
      details: t("benefitSelection.medicaidDetails"),
    },
    {
      id: "snap",
      title: t("benefitSelection.snapOnly"),
      description: t("benefitSelection.snapDescription"),
      details: t("benefitSelection.snapDetails"),
    },
    {
      id: "both",
      title: t("benefitSelection.both"),
      description: t("benefitSelection.bothDescription"),
      details: t("benefitSelection.bothDetails"),
    },
  ]

  const isOptionDisabled = (optionId: string) => {
    if (submittedApplications.includes("both")) {
      return true // All options disabled if both were submitted
    }

    if (optionId === "both") {
      return submittedApplications.includes("medicaid") || submittedApplications.includes("snap")
    }

    return submittedApplications.includes(optionId)
  }

  const getErrorMessage = (optionId: string) => {
    if (submittedApplications.includes("both")) {
      return t("benefitSelection.errors.alreadySubmittedBoth")
    }

    if (optionId === "both" && (submittedApplications.includes("medicaid") || submittedApplications.includes("snap"))) {
      return t("benefitSelection.errors.cannotApplyBothAfterIndividual")
    }

    if (submittedApplications.includes(optionId)) {
      const benefitName = optionId === "medicaid" ? t("benefits.medicaid") : t("benefits.snap")
      return t("benefitSelection.errors.alreadySubmittedIndividual", { benefitName })
    }

    return null
  }

  const allOptionsDisabled = BENEFIT_OPTIONS.every((option) => isOptionDisabled(option.id))

  const handleViewApplications = () => {
    router.push("/account?tab=applications")
  }

  if (allOptionsDisabled) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("benefitSelection.applicationStatus.title")}</h2>
          <p className="text-gray-600">{t("benefitSelection.applicationStatus.subtitle")}</p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-900 flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              {t("benefitSelection.applicationStatus.submitted")}
            </CardTitle>
            <CardDescription className="text-blue-800">
              {t("benefitSelection.applicationStatus.pendingReview")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-blue-800">{t("benefitSelection.applicationStatus.description")}</p>
            <Button onClick={handleViewApplications} className="bg-blue-600 hover:bg-blue-700 text-white">
              {t("benefitSelection.applicationStatus.viewApplications")}
            </Button>
          </CardContent>
        </Card>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">{t("benefitSelection.applicationStatus.whatHappensNext")}</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            {t("benefitSelection.applicationStatus.nextSteps", { returnObjects: true }).map(
              (step: string, index: number) => (
                <li key={index}>• {step}</li>
              ),
            )}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("benefitSelection.title")}</h2>
        <p className="text-gray-600">{t("benefitSelection.subtitle")}</p>
      </div>

      <div className="grid gap-4">
        {BENEFIT_OPTIONS.map((option) => {
          const disabled = isOptionDisabled(option.id)
          const errorMessage = getErrorMessage(option.id)

          return (
            <div key={option.id}>
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  disabled
                    ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                    : selectedBenefits === option.id
                      ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200 hover:shadow-md"
                      : "hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => !disabled && onBenefitSelect(option.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className={`text-lg font-medium ${disabled ? "text-gray-400" : "text-gray-900"}`}>
                        {option.title}
                      </CardTitle>
                      <CardDescription className={`text-sm mt-1 ${disabled ? "text-gray-400" : "text-gray-600"}`}>
                        {option.description}
                      </CardDescription>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        disabled
                          ? "border-gray-300 bg-gray-100"
                          : selectedBenefits === option.id
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                      }`}
                    >
                      {selectedBenefits === option.id && !disabled && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={`text-sm ${disabled ? "text-gray-400" : "text-gray-500"}`}>{option.details}</p>
                </CardContent>
              </Card>

              {errorMessage && (
                <Alert className="mt-2 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-medium text-blue-900 mb-2">{t("benefitSelection.importantInformation")}</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          {t("benefitSelection.importantInfoList", { returnObjects: true }).map((info: string, index: number) => (
            <li key={index}>• {info}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
