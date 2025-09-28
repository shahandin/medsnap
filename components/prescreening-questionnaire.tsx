"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context"

interface Question {
  id: string
  text: string
  helpText?: string
}

interface PrescreeningQuestionnaireProps {
  onComplete: (responses: Record<string, string>) => void
}

export function PrescreeningQuestionnaire({ onComplete }: PrescreeningQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const { t } = useTranslation()

  const questions: Question[] = [
    {
      id: "income",
      text: t("prescreening.questions.income.text"),
      helpText: t("prescreening.questions.income.help"),
    },
    {
      id: "assets",
      text: t("prescreening.questions.assets.text"),
      helpText: t("prescreening.questions.assets.help"),
    },
    {
      id: "citizenship",
      text: t("prescreening.questions.citizenship.text"),
      helpText: t("prescreening.questions.citizenship.help"),
    },
    {
      id: "age_disability",
      text: t("prescreening.questions.ageDisability.text"),
      helpText: t("prescreening.questions.ageDisability.help"),
    },
    {
      id: "household_size",
      text: t("prescreening.questions.householdSize.text"),
      helpText: t("prescreening.questions.householdSize.help"),
    },
    {
      id: "work_requirements",
      text: t("prescreening.questions.workRequirements.text"),
      helpText: t("prescreening.questions.workRequirements.help"),
    },
  ]

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
            {(() => {
              console.log("[v0] Calling translation with:", {
                key: "prescreening.questionProgress",
                variables: { current: currentQuestion + 1, total: questions.length },
              })
              const result = t("prescreening.questionProgress", {
                variables: { current: currentQuestion + 1, total: questions.length },
              })
              console.log("[v0] Translation result:", result)
              return result
            })()}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}% {t("prescreening.complete")}
          </span>
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
                {t("common.yes")}
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="text-base font-medium cursor-pointer flex-1">
                {t("common.no")}
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
              <span>{t("common.previous")}</span>
            </Button>

            <Button onClick={handleNext} disabled={!currentAnswer} className="flex items-center space-x-2">
              <span>{currentQuestion === questions.length - 1 ? t("common.complete") : t("common.next")}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
