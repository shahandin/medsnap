"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface Question {
  id: string
  text: string
  helpText?: string
}

interface PrescreeningQuestionnaireProps {
  onComplete: (responses: Record<string, string>) => void
}

const questions: Question[] = [
  {
    id: "income",
    text: "Is your household's monthly income less than $2,500?",
    helpText: "Include all income from jobs, benefits, and other sources for everyone in your household.",
  },
  {
    id: "assets",
    text: "Do you have less than $2,000 in savings and assets?",
    helpText: "Include bank accounts, investments, and valuable items (excluding your home and one car).",
  },
  {
    id: "citizenship",
    text: "Are you a U.S. citizen or qualified non-citizen?",
    helpText: "Qualified non-citizens include permanent residents and certain other immigration statuses.",
  },
  {
    id: "age_disability",
    text: "Are you 65 or older, pregnant, or have a disability?",
    helpText: "This helps determine eligibility for certain Medicaid programs.",
  },
  {
    id: "household_size",
    text: "Do you have 4 or fewer people in your household?",
    helpText: "Count yourself, your spouse (if married), and any dependents you claim on taxes.",
  },
  {
    id: "work_requirements",
    text: "Are you working at least 20 hours per week, or do you qualify for an exemption?",
    helpText: "Exemptions include being under 18, over 50, pregnant, disabled, or caring for young children.",
  },
]

export function PrescreeningQuestionnaire({ onComplete }: PrescreeningQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})

  const handleAnswer = (value: string) => {
    const newResponses = {
      ...responses,
      [questions[currentQuestion].id]: value,
    }
    setResponses(newResponses)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onComplete(responses)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentAnswer = responses[questions[currentQuestion].id]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="card-modern">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl font-semibold">{questions[currentQuestion].text}</CardTitle>
          {questions[currentQuestion].helpText && (
            <CardDescription className="text-base mt-3">{questions[currentQuestion].helpText}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={currentAnswer || ""} onValueChange={handleAnswer} className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="text-base font-medium cursor-pointer flex-1">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="text-base font-medium cursor-pointer flex-1">
                No
              </Label>
            </div>
          </RadioGroup>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button onClick={handleNext} disabled={!currentAnswer} className="flex items-center space-x-2">
              <span>{currentQuestion === questions.length - 1 ? "Complete" : "Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
