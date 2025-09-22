"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, ArrowRight, Info } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context"

interface EligibilityResults {
  medicaidEligible: boolean
  snapEligible: boolean
}

interface PrescreeningResultsProps {
  results: EligibilityResults
  onContinue: () => void
}

export function PrescreeningResults({ results, onContinue }: PrescreeningResultsProps) {
  const { medicaidEligible, snapEligible } = results
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("prescreening.results.title")}</h1>
        <p className="text-muted-foreground">{t("prescreening.results.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={`card-modern ${medicaidEligible ? "border-green-200 bg-green-50/50" : "border-orange-200 bg-orange-50/50"}`}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3">
              {medicaidEligible ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <CardTitle className="text-lg">{t("benefits.medicaid")}</CardTitle>
            <CardDescription>
              {medicaidEligible ? (
                <span className="text-green-700 font-medium">{t("prescreening.results.mayQualify")}</span>
              ) : (
                <span className="text-orange-700 font-medium">{t("prescreening.results.mayNotQualify")}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm">
            {medicaidEligible ? (
              <p className="text-green-700">{t("prescreening.results.medicaidEligible")}</p>
            ) : (
              <p className="text-orange-700">{t("prescreening.results.medicaidNotEligible")}</p>
            )}
          </CardContent>
        </Card>

        <Card
          className={`card-modern ${snapEligible ? "border-green-200 bg-green-50/50" : "border-orange-200 bg-orange-50/50"}`}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3">
              {snapEligible ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <CardTitle className="text-lg">{t("benefits.snap")}</CardTitle>
            <CardDescription>
              {snapEligible ? (
                <span className="text-green-700 font-medium">{t("prescreening.results.mayQualify")}</span>
              ) : (
                <span className="text-orange-700 font-medium">{t("prescreening.results.mayNotQualify")}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm">
            {snapEligible ? (
              <p className="text-green-700">{t("prescreening.results.snapEligible")}</p>
            ) : (
              <p className="text-orange-700">{t("prescreening.results.snapNotEligible")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-modern border-blue-200 bg-blue-50/50">
        <CardContent className="flex items-start space-x-3 pt-6">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{t("prescreening.results.importantNote")}</p>
            <p>{t("prescreening.results.disclaimer")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-4">
        <Button onClick={onContinue} size="lg" className="px-8">
          {t("prescreening.results.continueToApplications")}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
