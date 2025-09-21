"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PrescreeningQuestionnaire } from "./prescreening-questionnaire"
import { PrescreeningResults } from "./prescreening-results"
import { useTranslation } from "@/contexts/translation-context"

interface EligibilityResults {
  medicaidEligible: boolean
  snapEligible: boolean
}

export function PrescreeningClient() {
  const { t } = useTranslation()
  const [step, setStep] = useState<"questionnaire" | "results">("questionnaire")
  const [results, setResults] = useState<EligibilityResults | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkPrescreeningStatus = async () => {
      try {
        const response = await fetch("/api/prescreening")
        if (response.ok) {
          const data = await response.json()
          if (data.completed) {
            // User has already completed prescreening, redirect to application choice
            router.push("/application-choice")
          }
        }
      } catch (error) {
        console.error("Error checking prescreening status:", error)
      }
    }

    checkPrescreeningStatus()
  }, [router])

  const calculateEligibility = (responses: Record<string, string>): EligibilityResults => {
    const yesCount = Object.values(responses).filter((response) => response === "yes").length

    // Medicaid eligibility: needs citizenship + (income OR assets OR age/disability)
    const medicaidEligible =
      responses.citizenship === "yes" &&
      (responses.income === "yes" || responses.assets === "yes" || responses.age_disability === "yes")

    // SNAP eligibility: needs citizenship + income + assets + household size + work requirements
    const snapEligible =
      responses.citizenship === "yes" &&
      responses.income === "yes" &&
      responses.assets === "yes" &&
      responses.household_size === "yes" &&
      responses.work_requirements === "yes"

    return { medicaidEligible, snapEligible }
  }

  const handleQuestionnaireComplete = async (responses: Record<string, string>) => {
    setLoading(true)

    try {
      const eligibilityResults = calculateEligibility(responses)

      const response = await fetch("/api/prescreening", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses,
          medicaid_eligible: eligibilityResults.medicaidEligible,
          snap_eligible: eligibilityResults.snapEligible,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save prescreening results")
      }

      setResults(eligibilityResults)
      setStep("results")
    } catch (error) {
      console.error("Error saving prescreening:", error)
      // Still show results even if saving fails
      setResults(calculateEligibility(responses))
      setStep("results")
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    router.push("/application-choice")
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("prescreening.processingMessage")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto">
      {step === "questionnaire" && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("prescreening.title")}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("prescreening.subtitle")}</p>
          </div>
          <PrescreeningQuestionnaire onComplete={handleQuestionnaireComplete} />
        </div>
      )}

      {step === "results" && results && <PrescreeningResults results={results} onContinue={handleContinue} />}
    </div>
  )
}
