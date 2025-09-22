"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileText, User, Users, DollarSign, Heart, Send, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/translations"

interface ReviewSubmissionProps {
  applicationData: any
  onSubmit: () => void
  onEdit: (step: number) => void
}

export function ReviewSubmission({ applicationData, onSubmit, onEdit }: ReviewSubmissionProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [certifyTruth, setCertifyTruth] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleSubmit = async () => {
    if (!agreedToTerms || !certifyTruth) return

    setIsSubmitting(true)

    try {
      console.log("[v0] 🚀 Starting application submission...")

      const response = await fetch("/api/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationData,
          benefitType: applicationData.benefitType,
        }),
      })

      const result = await response.json()

      console.log("[v0] 📤 Submission result:", result)

      if (!response.ok || result.error) {
        console.error("[v0] ❌ Error submitting application:", result.error)

        if (result.details) {
          console.error("[v0] 🔍 Error Details:")
          console.error("[v0] - Step:", result.details.step)
          console.error("[v0] - Message:", result.details.message)
          if (result.details.authError) console.error("[v0] - Auth Error:", result.details.authError)
          if (result.details.dbError) console.error("[v0] - Database Error:", result.details.dbError)
          if (result.details.dbCode) console.error("[v0] - Database Code:", result.details.dbCode)
          if (result.details.stack) console.error("[v0] - Stack Trace:", result.details.stack)

          // Human-friendly error messages
          if (result.details.step === "authentication") {
            console.error("[v0] 👤 HUMAN: Authentication failed - user session is not valid on server")
          } else if (result.details.step === "database_insert") {
            console.error("[v0] 💾 HUMAN: Database operation failed - could be schema issue or connection problem")
          } else if (result.details.step === "unexpected_error") {
            console.error("[v0] ⚠️ HUMAN: Unexpected server error occurred during processing")
          }
        }

        // Check if it's an authentication error
        if (response.status === 401 || result.error?.includes("logged in") || result.error?.includes("sign in")) {
          alert(t("reviewSubmission.errors.sessionExpired"))
          router.push("/signin")
          return
        }

        alert(`Error: ${result.error || t("reviewSubmission.errors.submissionFailed")}`)
        setIsSubmitting(false)
        return
      }

      console.log("[v0] ✅ Application submitted successfully")

      onSubmit()

      console.log("[v0] 🔄 Redirecting to success page...")
      router.push("/application/success")
    } catch (error) {
      console.error("[v0] ❌ Exception during submission:", error)
      console.error("[v0] 🔍 Client Exception Details:")
      console.error("[v0] - Error Type:", typeof error)
      console.error("[v0] - Error Message:", error instanceof Error ? error.message : "Unknown")
      console.error("[v0] - Stack Trace:", error instanceof Error ? error.stack : "No stack")
      console.error("[v0] 👤 HUMAN: Network or client-side JavaScript error occurred")

      alert(t("reviewSubmission.errors.unexpectedError"))
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      weekly: "Weekly",
      bi_weekly: "Bi-Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      annually: "Annually",
    }
    return labels[frequency] || frequency
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("reviewSubmission.reviewYourApplication")}</h3>
        <p className="text-gray-600">{t("reviewSubmission.reviewDescription")}</p>
      </div>

      {/* State Selection Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("reviewSubmission.stateSelection")}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(0)}>
            {t("common.edit")}
          </Button>
        </CardHeader>
        <CardContent>
          <p>
            <strong>{t("common.state")}:</strong> {applicationData.state || t("common.notSelected")}
          </p>
        </CardContent>
      </Card>

      {/* Personal Information Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("reviewSubmission.personalInformation")}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(1)}>
            {t("common.edit")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>{t("common.name")}:</strong> {applicationData.personalInfo?.firstName}{" "}
            {applicationData.personalInfo?.lastName}
          </p>
          <p>
            <strong>{t("common.dateOfBirth")}:</strong>{" "}
            {applicationData.personalInfo?.dateOfBirth
              ? new Date(applicationData.personalInfo.dateOfBirth).toLocaleDateString()
              : t("common.notProvided")}
          </p>
          <p>
            <strong>{t("common.address")}:</strong> {applicationData.personalInfo?.address?.street},{" "}
            {applicationData.personalInfo?.address?.city}, {applicationData.personalInfo?.address?.state}{" "}
            {applicationData.personalInfo?.address?.zipCode}
          </p>
          <p>
            <strong>{t("common.phone")}:</strong> {applicationData.personalInfo?.phone}
          </p>
          <p>
            <strong>{t("common.email")}:</strong> {applicationData.personalInfo?.email}
          </p>
          <p>
            <strong>{t("common.citizenshipStatus")}:</strong> {applicationData.personalInfo?.citizenshipStatus}
          </p>
        </CardContent>
      </Card>

      {/* Household Members Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t("reviewSubmission.householdMembers")} ({applicationData.householdMembers?.length || 0})
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(2)}>
            {t("common.edit")}
          </Button>
        </CardHeader>
        <CardContent>
          {applicationData.householdMembers?.length > 0 ? (
            <div className="space-y-2">
              {applicationData.householdMembers.map((member: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>
                    {member.firstName} {member.lastName}
                  </span>
                  <Badge variant="secondary">{member.relationship}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t("common.noAdditionalHouseholdMembers")}</p>
          )}
        </CardContent>
      </Card>

      {/* Income & Employment Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t("reviewSubmission.incomeEmployment")}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(3)}>
            {t("common.edit")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>
              <strong>{t("common.taxFilingStatus")}:</strong>{" "}
              {applicationData.incomeEmployment?.taxFilingStatus || t("common.notSpecified")}
            </p>
          </div>

          {applicationData.incomeEmployment?.employment?.length > 0 && (
            <div>
              <p className="font-medium mb-2">{t("common.employment")}:</p>
              {applicationData.incomeEmployment.employment.map((emp: any, index: number) => (
                <div key={index} className="ml-4 mb-2">
                  <p>
                    {emp.memberName}: {emp.status}
                  </p>
                  {emp.employer && (
                    <p className="text-sm text-gray-600">
                      {t("common.employer")}: {emp.employer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {applicationData.incomeEmployment?.income?.length > 0 && (
            <div>
              <p className="font-medium mb-2">{t("common.additionalIncome")}:</p>
              {applicationData.incomeEmployment.income.map((inc: any, index: number) => (
                <div key={index} className="ml-4 mb-2">
                  <p>
                    {inc.memberName}: {inc.type} - {formatCurrency(inc.amount)} {getFrequencyLabel(inc.frequency)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {applicationData.incomeEmployment?.expenses?.length > 0 && (
            <div>
              <p className="font-medium mb-2">{t("common.deductibleExpenses")}:</p>
              {applicationData.incomeEmployment.expenses.map((exp: any, index: number) => (
                <div key={index} className="ml-4 mb-2">
                  <p>
                    {exp.memberName}: {exp.type} - {formatCurrency(exp.amount)} {getFrequencyLabel(exp.frequency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health & Disability Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {t("reviewSubmission.healthDisability")}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(4)}>
            {t("common.edit")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>
              <strong>{t("common.disabilityInHousehold")}:</strong>{" "}
              {applicationData.healthDisability?.disabilities?.hasDisabled ? t("common.yes") : t("common.no")}
            </p>
            <p>
              <strong>{t("common.longTermCareNeeded")}:</strong>{" "}
              {applicationData.healthDisability?.disabilities?.needsLongTermCare ? t("common.yes") : t("common.no")}
            </p>
            <p>
              <strong>{t("common.incarcerationInHousehold")}:</strong>{" "}
              {applicationData.healthDisability?.disabilities?.hasIncarcerated ? t("common.yes") : t("common.no")}
            </p>
          </div>

          {applicationData.healthDisability?.pregnancyInfo?.isPregnant && (
            <div>
              <p>
                <strong>{t("common.pregnancy")}:</strong> {t("common.yes")} (
                {applicationData.healthDisability.pregnancyInfo.memberName})
              </p>
              {applicationData.healthDisability.pregnancyInfo.dueDate && (
                <p className="text-sm text-gray-600">
                  {t("common.dueDate")}:{" "}
                  {new Date(applicationData.healthDisability.pregnancyInfo.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {applicationData.healthDisability?.medicalConditions?.hasChronicConditions && (
            <div>
              <p>
                <strong>{t("common.chronicConditions")}:</strong> {t("common.yes")}
              </p>
              {applicationData.healthDisability.medicalConditions.conditions?.length > 0 && (
                <p className="text-sm text-gray-600">
                  {t("common.conditions")}: {applicationData.healthDisability.medicalConditions.conditions.join(", ")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms and Certification */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            {t("reviewSubmission.certificationAgreement")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t("reviewSubmission.certificationAlert")}</AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                {t("reviewSubmission.agreeToTerms")}
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="certify"
                checked={certifyTruth}
                onCheckedChange={(checked) => setCertifyTruth(checked as boolean)}
              />
              <Label htmlFor="certify" className="text-sm leading-relaxed">
                {t("reviewSubmission.certifyTruth")}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!agreedToTerms || !certifyTruth || isSubmitting}
          size="lg"
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t("reviewSubmission.submittingApplication")}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {t("reviewSubmission.submitApplication")}
            </>
          )}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          {t("reviewSubmission.submitDescription", { state: applicationData.state || t("common.yourState") })}
        </p>
      </div>
    </div>
  )
}
