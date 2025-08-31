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

  const handleSubmit = async () => {
    if (!agreedToTerms || !certifyTruth) return

    setIsSubmitting(true)

    try {
      console.log("[v0] 🚀 Starting application submission...")

      const { submitApplication } = await import("@/lib/actions")
      const result = await submitApplication(applicationData, applicationData.benefitType)

      console.log("[v0] 📤 Submission result:", result)

      if (!result.success || result.error) {
        console.error("[v0] ❌ Error submitting application:", result.error)

        // Check if it's an authentication error
        if (result.error?.includes("logged in") || result.error?.includes("sign in")) {
          alert("Your session has expired. Please sign in again and try submitting your application.")
          // Redirect to sign in page
          router.push("/signin")
          return
        }

        // Handle other errors
        alert(`Error: ${result.error || "There was an error submitting your application. Please try again."}`)
        setIsSubmitting(false)
        return
      }

      console.log("[v0] ✅ Application submitted successfully")

      onSubmit()

      console.log("[v0] 🔄 Redirecting to success page...")
      router.push("/application/success")
    } catch (error) {
      console.error("[v0] ❌ Exception during submission:", error)
      alert("There was an unexpected error submitting your application. Please try again or contact support.")
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
        <h3 className="text-xl font-semibold mb-2">Review Your Application</h3>
        <p className="text-gray-600">
          Please review all information before submitting your application. You can edit any section by clicking the
          edit button.
        </p>
      </div>

      {/* State Selection Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              State Selection
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(0)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <p>
            <strong>State:</strong> {applicationData.state || "Not selected"}
          </p>
        </CardContent>
      </Card>

      {/* Personal Information Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(1)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {applicationData.personalInfo?.firstName} {applicationData.personalInfo?.lastName}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {applicationData.personalInfo?.dateOfBirth
              ? new Date(applicationData.personalInfo.dateOfBirth).toLocaleDateString()
              : "Not provided"}
          </p>
          <p>
            <strong>Address:</strong> {applicationData.personalInfo?.address?.street},{" "}
            {applicationData.personalInfo?.address?.city}, {applicationData.personalInfo?.address?.state}{" "}
            {applicationData.personalInfo?.address?.zipCode}
          </p>
          <p>
            <strong>Phone:</strong> {applicationData.personalInfo?.phone}
          </p>
          <p>
            <strong>Email:</strong> {applicationData.personalInfo?.email}
          </p>
          <p>
            <strong>Citizenship Status:</strong> {applicationData.personalInfo?.citizenshipStatus}
          </p>
        </CardContent>
      </Card>

      {/* Household Members Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Household Members ({applicationData.householdMembers?.length || 0})
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(2)}>
            Edit
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
            <p className="text-gray-500">No additional household members</p>
          )}
        </CardContent>
      </Card>

      {/* Income & Employment Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Income & Employment
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(3)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>
              <strong>Tax Filing Status:</strong> {applicationData.incomeEmployment?.taxFilingStatus || "Not specified"}
            </p>
          </div>

          {applicationData.incomeEmployment?.employment?.length > 0 && (
            <div>
              <p className="font-medium mb-2">Employment:</p>
              {applicationData.incomeEmployment.employment.map((emp: any, index: number) => (
                <div key={index} className="ml-4 mb-2">
                  <p>
                    {emp.memberName}: {emp.status}
                  </p>
                  {emp.employer && <p className="text-sm text-gray-600">Employer: {emp.employer}</p>}
                </div>
              ))}
            </div>
          )}

          {applicationData.incomeEmployment?.income?.length > 0 && (
            <div>
              <p className="font-medium mb-2">Additional Income:</p>
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
              <p className="font-medium mb-2">Deductible Expenses:</p>
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
              Health & Disability
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(4)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>
              <strong>Disability in Household:</strong>{" "}
              {applicationData.healthDisability?.disabilities?.hasDisabled ? "Yes" : "No"}
            </p>
            <p>
              <strong>Long-term Care Needed:</strong>{" "}
              {applicationData.healthDisability?.disabilities?.needsLongTermCare ? "Yes" : "No"}
            </p>
            <p>
              <strong>Incarceration in Household:</strong>{" "}
              {applicationData.healthDisability?.disabilities?.hasIncarcerated ? "Yes" : "No"}
            </p>
          </div>

          {applicationData.healthDisability?.pregnancyInfo?.isPregnant && (
            <div>
              <p>
                <strong>Pregnancy:</strong> Yes ({applicationData.healthDisability.pregnancyInfo.memberName})
              </p>
              {applicationData.healthDisability.pregnancyInfo.dueDate && (
                <p className="text-sm text-gray-600">
                  Due Date: {new Date(applicationData.healthDisability.pregnancyInfo.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {applicationData.healthDisability?.medicalConditions?.hasChronicConditions && (
            <div>
              <p>
                <strong>Chronic Conditions:</strong> Yes
              </p>
              {applicationData.healthDisability.medicalConditions.conditions?.length > 0 && (
                <p className="text-sm text-gray-600">
                  Conditions: {applicationData.healthDisability.medicalConditions.conditions.join(", ")}
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
            Certification and Agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              By submitting this application, you are applying for Medicaid and/or SNAP benefits. False information may
              result in denial of benefits or legal consequences.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to the terms and conditions and understand that this application will be processed according to
                state and federal guidelines. I consent to verification of the information provided.
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="certify"
                checked={certifyTruth}
                onCheckedChange={(checked) => setCertifyTruth(checked as boolean)}
              />
              <Label htmlFor="certify" className="text-sm leading-relaxed">
                I certify that all information provided in this application is true and complete to the best of my
                knowledge. I understand that providing false information may result in denial of benefits and/or legal
                action.
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
              Submitting Application...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          This will submit your application to {applicationData.state || "your state"} for processing.
        </p>
      </div>
    </div>
  )
}
