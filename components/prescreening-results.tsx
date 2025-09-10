"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, ArrowRight, Info } from "lucide-react"

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Eligibility Results</h1>
        <p className="text-muted-foreground">Based on your responses, here's your potential eligibility for benefits</p>
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
            <CardTitle className="text-lg">Medicaid</CardTitle>
            <CardDescription>
              {medicaidEligible ? (
                <span className="text-green-700 font-medium">Potentially Eligible</span>
              ) : (
                <span className="text-orange-700 font-medium">May Not Qualify</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm">
            {medicaidEligible ? (
              <p className="text-green-700">
                You may qualify for Medicaid health coverage. Complete the full application to verify your eligibility.
              </p>
            ) : (
              <p className="text-orange-700">
                Based on your responses, you may not qualify for Medicaid. However, eligibility rules are complex -
                consider applying anyway.
              </p>
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
            <CardTitle className="text-lg">SNAP</CardTitle>
            <CardDescription>
              {snapEligible ? (
                <span className="text-green-700 font-medium">Potentially Eligible</span>
              ) : (
                <span className="text-orange-700 font-medium">May Not Qualify</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm">
            {snapEligible ? (
              <p className="text-green-700">
                You may qualify for SNAP food assistance. Complete the full application to verify your eligibility.
              </p>
            ) : (
              <p className="text-orange-700">
                Based on your responses, you may not qualify for SNAP. However, eligibility rules are complex - consider
                applying anyway.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-modern border-blue-200 bg-blue-50/50">
        <CardContent className="flex items-start space-x-3 pt-6">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Note</p>
            <p>
              This is a preliminary assessment only. Final eligibility is determined by your state agency after
              reviewing your complete application and verifying your information. We encourage you to apply even if the
              prescreening suggests you may not qualify.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-4">
        <Button onClick={onContinue} size="lg" className="px-8">
          Continue to Applications
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
