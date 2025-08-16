"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BenefitSelection } from "@/components/benefit-selection"
import { StateSelection } from "@/components/state-selection"
import { PersonalInformationForm } from "@/components/personal-information-form"
import { HouseholdManagement } from "@/components/household-management"
import HouseholdQuestions from "@/components/household-questions"
import { IncomeEmploymentForm } from "@/components/income-employment-form"
import { AssetsForm } from "@/components/assets-form"
import { HealthDisabilityForm } from "@/components/health-disability-form"
import { ReviewSubmission } from "@/components/review-submission"
import { saveApplicationProgress, loadApplicationProgress, clearApplicationProgress } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"

const STEPS = [
  { id: "benefits", title: "Benefit Selection", description: "Choose which benefits to apply for" },
  { id: "state", title: "State Selection", description: "Select your state of residence" },
  { id: "personal", title: "Personal Information", description: "Basic personal details and application context" },
  { id: "household", title: "Household Members", description: "Add household members" },
  { id: "household-questions", title: "Household Questions", description: "Questions about household benefit history" },
  {
    id: "income",
    title: "Income & Expenses",
    description: "Employment, income sources, housing costs, and tax-deductible expenses",
  },
  { id: "assets", title: "Assets", description: "Financial assets, vehicles, and life insurance" },
  { id: "health", title: "Health & Disability", description: "Health insurance and disability information" },
  { id: "review", title: "Review & Submit", description: "Review your application" },
]

export default function BenefitsApplicationClient() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [submittedApplications, setSubmittedApplications] = useState<string[]>([])
  const [isInitializing, setIsInitializing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const startFresh = searchParams.get("fresh") === "true"
  const stepParam = searchParams.get("step")

  const [applicationData, setApplicationData] = useState({
    benefitType: "",
    state: "",
    personalInfo: {
      applyingFor: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      languagePreference: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      phone: "",
      email: "",
      citizenshipStatus: "",
      socialSecurityNumber: "",
    },
    householdMembers: [],
    householdQuestions: {
      appliedWithDifferentInfo: "",
      appliedWithDifferentInfoMembers: [],
      appliedInOtherState: "",
      appliedInOtherStateMembers: [],
      receivedBenefitsBefore: "",
      receivedBenefitsBeforeMembers: [],
      receivingSNAPThisMonth: "",
      receivingSNAPThisMonthMembers: [],
      disqualifiedFromBenefits: "",
      disqualifiedFromBenefitsMembers: [],
      wantSomeoneElseToReceiveSNAP: "",
      wantSomeoneElseToReceiveSNAPMembers: [],
    },
    incomeEmployment: {
      taxFilingStatus: "",
      employment: [],
      income: [],
      expenses: [],
      housingExpenses: [],
    },
    assets: {
      assets: [],
    },
    healthDisability: {
      healthInsurance: [],
      disabilities: {
        hasDisabled: false,
        needsLongTermCare: false,
        hasIncarcerated: false,
      },
      pregnancyInfo: {
        isPregnant: false,
      },
      medicalConditions: {
        hasChronicConditions: false,
        conditions: [],
      },
      medicalBills: {
        hasRecentBills: false,
      },
      needsNursingServices: "",
    },
  })
  const personalInfoRef = useRef(null)

  useEffect(() => {
    if (stepParam && !isLoading) {
      const stepNumber = Number.parseInt(stepParam)
      if (!Number.isNaN(stepNumber) && stepNumber >= 0 && stepNumber < STEPS.length) {
        setCurrentStep(stepNumber)
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete("step")
        window.history.replaceState({}, "", newUrl.toString())
      }
    }
  }, [stepParam, isLoading])

  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        console.log("🔄 Loading saved progress...")
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.log("❌ No user found, redirecting to login")
          router.push("/signin")
          return
        }

        console.log("👤 User found:", user.email)

        if (startFresh) {
          console.log("🆕 Starting fresh application, clearing all saved progress")
          setIsInitializing(true)

          await clearApplicationProgress()

          const initialData = {
            benefitType: "",
            state: "",
            personalInfo: {
              applyingFor: "",
              firstName: "",
              lastName: "",
              dateOfBirth: "",
              languagePreference: "",
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
              },
              phone: "",
              email: "",
              citizenshipStatus: "",
              socialSecurityNumber: "",
            },
            householdMembers: [],
            householdQuestions: {
              appliedWithDifferentInfo: "",
              appliedWithDifferentInfoMembers: [],
              appliedInOtherState: "",
              appliedInOtherStateMembers: [],
              receivedBenefitsBefore: "",
              receivedBenefitsBeforeMembers: [],
              receivingSNAPThisMonth: "",
              receivingSNAPThisMonthMembers: [],
              disqualifiedFromBenefits: "",
              disqualifiedFromBenefitsMembers: [],
              wantSomeoneElseToReceiveSNAP: "",
              wantSomeoneElseToReceiveSNAPMembers: [],
            },
            incomeEmployment: {
              taxFilingStatus: "",
              employment: [],
              income: [],
              expenses: [],
              housingExpenses: [],
            },
            assets: {
              assets: [],
            },
            healthDisability: {
              healthInsurance: [],
              disabilities: {
                hasDisabled: false,
                needsLongTermCare: false,
                hasIncarcerated: false,
              },
              pregnancyInfo: {
                isPregnant: false,
              },
              medicalConditions: {
                hasChronicConditions: false,
                conditions: [],
              },
              medicalBills: {
                hasRecentBills: false,
              },
              needsNursingServices: "",
            },
          }

          setApplicationData(initialData)
          setCurrentStep(0)

          const { getSubmittedApplications } = await import("@/lib/actions")
          const applicationsResult = await getSubmittedApplications()
          if (applicationsResult.data) {
            const submittedTypes = applicationsResult.data.map((app: any) => app.benefit_type)
            setSubmittedApplications(submittedTypes)
          }

          setIsLoading(false)
          setTimeout(() => setIsInitializing(false), 500)
          return
        }

        const result = await loadApplicationProgress()
        console.log("📊 Load progress result:", result)

        if (result.data) {
          console.log("✅ Progress found, restoring data")
          console.log("📋 Application data:", result.data.application_data)
          console.log("📍 Current step:", result.data.current_step)

          setApplicationData(result.data.application_data)
          setCurrentStep(result.data.current_step)
        } else {
          console.log("ℹ️ No saved progress found, starting fresh")
        }

        const { getSubmittedApplications } = await import("@/lib/actions")
        const applicationsResult = await getSubmittedApplications()
        if (applicationsResult.data) {
          const submittedTypes = applicationsResult.data.map((app: any) => app.benefit_type)
          setSubmittedApplications(submittedTypes)
        }
      } catch (error) {
        console.error("❌ Error loading progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedProgress()
  }, [router, startFresh])

  useEffect(() => {
    if (!isLoading && !isInitializing) {
      const autoSave = async () => {
        try {
          console.log("💾 Auto-saving progress...")
          console.log("📊 Current step:", currentStep)
          console.log("📋 Application data:", applicationData)
          const result = await saveApplicationProgress(applicationData, currentStep)
          console.log("💾 Save result:", result)
        } catch (error) {
          console.error("❌ Auto-save error:", error)
        }
      }

      const timeoutId = setTimeout(autoSave, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [applicationData, currentStep, isLoading, isInitializing])

  useEffect(() => {
    if (!isLoading && !isInitializing) {
      const periodicSave = setInterval(async () => {
        try {
          console.log("⏰ Periodic auto-save...")
          await saveApplicationProgress(applicationData, currentStep)
        } catch (error) {
          console.error("❌ Periodic save error:", error)
        }
      }, 30000)

      return () => clearInterval(periodicSave)
    }
  }, [applicationData, currentStep, isLoading, isInitializing])

  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (!isInitializing) {
        try {
          console.log("🚪 Page unloading, saving progress...")
          const data = JSON.stringify({
            applicationData,
            currentStep,
          })

          if (navigator.sendBeacon) {
            const formData = new FormData()
            formData.append("data", data)
            navigator.sendBeacon("/api/save-progress", formData)
          } else {
            await saveApplicationProgress(applicationData, currentStep)
          }
        } catch (error) {
          console.error("❌ Error saving on unload:", error)
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [applicationData, currentStep, isInitializing])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && !isLoading && !isInitializing) {
        try {
          console.log("👁️ Page hidden, saving progress...")
          await saveApplicationProgress(applicationData, currentStep)
        } catch (error) {
          console.error("❌ Error saving on visibility change:", error)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [applicationData, currentStep, isLoading, isInitializing])

  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).applicationContext = {
        currentStep,
        stepTitle: STEPS[currentStep]?.title,
        stepDescription: STEPS[currentStep]?.description,
        benefitType: applicationData.benefitType,
        state: applicationData.state,
        personalInfo: applicationData.personalInfo,
        completedSteps: currentStep,
        totalSteps: STEPS.length,
        canProceed: canProceed(),
      }
    }
  }, [currentStep, applicationData])

  const updateApplicationData = (updates: any) => {
    setApplicationData((prev) => ({ ...prev, ...updates }))

    if (!isInitializing) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          console.log("📝 Form changed, auto-saving...")
          await saveApplicationProgress({ ...applicationData, ...updates }, currentStep)
        } catch (error) {
          console.error("❌ Form change save error:", error)
        }
      }, 3000)
    }
  }

  const nextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      try {
        console.log("➡️ Moving to next step, saving progress...")
        const result = await saveApplicationProgress(applicationData, currentStep + 1)
        console.log("💾 Save result:", result)
      } catch (error) {
        console.error("❌ Auto-save error:", error)
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = async () => {
    if (currentStep > 0) {
      try {
        console.log("⬅️ Moving to previous step, saving progress...")
        const result = await saveApplicationProgress(applicationData, currentStep - 1)
        console.log("💾 Save result:", result)
      } catch (error) {
        console.error("❌ Auto-save error:", error)
      }
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const handleSubmit = async () => {
    console.log("Application submitted:", applicationData)
    resetApplication()
  }

  const resetApplication = () => {
    setApplicationData({
      benefitType: "",
      state: "",
      personalInfo: {
        applyingFor: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        languagePreference: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
        phone: "",
        email: "",
        citizenshipStatus: "",
        socialSecurityNumber: "",
      },
      householdMembers: [],
      householdQuestions: {
        appliedWithDifferentInfo: "",
        appliedWithDifferentInfoMembers: [],
        appliedInOtherState: "",
        appliedInOtherStateMembers: [],
        receivedBenefitsBefore: "",
        receivedBenefitsBeforeMembers: [],
        receivingSNAPThisMonth: "",
        receivingSNAPThisMonthMembers: [],
        disqualifiedFromBenefits: "",
        disqualifiedFromBenefitsMembers: [],
        wantSomeoneElseToReceiveSNAP: "",
        wantSomeoneElseToReceiveSNAPMembers: [],
      },
      incomeEmployment: {
        taxFilingStatus: "",
        employment: [],
        income: [],
        expenses: [],
        housingExpenses: [],
      },
      assets: {
        assets: [],
      },
      healthDisability: {
        healthInsurance: [],
        disabilities: {
          hasDisabled: false,
          needsLongTermCare: false,
          hasIncarcerated: false,
        },
        pregnancyInfo: {
          isPregnant: false,
        },
        medicalConditions: {
          hasChronicConditions: false,
          conditions: [],
        },
        medicalBills: {
          hasRecentBills: false,
        },
        needsNursingServices: "",
      },
    })
    setCurrentStep(0)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return applicationData.benefitType !== ""
      case 1:
        return applicationData.state !== ""
      case 2:
        const { personalInfo } = applicationData
        const basicInfoComplete =
          personalInfo.applyingFor !== "" &&
          personalInfo.firstName.trim() !== "" &&
          personalInfo.lastName.trim() !== "" &&
          personalInfo.dateOfBirth !== "" &&
          personalInfo.languagePreference !== "" &&
          personalInfo.address.street.trim() !== "" &&
          personalInfo.address.city.trim() !== "" &&
          personalInfo.address.zipCode.trim() !== "" &&
          personalInfo.phone.trim() !== "" &&
          personalInfo.email.trim() !== "" &&
          personalInfo.citizenshipStatus !== "" &&
          personalInfo.socialSecurityNumber.trim() !== ""
        return basicInfoComplete
      case 4:
        const { householdQuestions } = applicationData
        const isApplyingForSNAP = applicationData.benefitType === "snap" || applicationData.benefitType === "both"
        const basicQuestionsComplete =
          householdQuestions.appliedWithDifferentInfo !== "" &&
          householdQuestions.appliedInOtherState !== "" &&
          householdQuestions.receivedBenefitsBefore !== ""
        const snapQuestionsComplete =
          !isApplyingForSNAP ||
          (householdQuestions.receivingSNAPThisMonth !== "" &&
            householdQuestions.disqualifiedFromBenefits !== "" &&
            householdQuestions.wantSomeoneElseToReceiveSNAP !== "")

        const memberSelectionsValid = [
          {
            answer: householdQuestions.appliedWithDifferentInfo,
            members: householdQuestions.appliedWithDifferentInfoMembers,
          },
          { answer: householdQuestions.appliedInOtherState, members: householdQuestions.appliedInOtherStateMembers },
          {
            answer: householdQuestions.receivedBenefitsBefore,
            members: householdQuestions.receivedBenefitsBeforeMembers,
          },
          ...(isApplyingForSNAP
            ? [
                {
                  answer: householdQuestions.receivingSNAPThisMonth,
                  members: householdQuestions.receivingSNAPThisMonthMembers,
                },
                {
                  answer: householdQuestions.disqualifiedFromBenefits,
                  members: householdQuestions.disqualifiedFromBenefitsMembers,
                },
                {
                  answer: householdQuestions.wantSomeoneElseToReceiveSNAP,
                  members: householdQuestions.wantSomeoneElseToReceiveSNAPMembers,
                },
              ]
            : []),
        ].every(({ answer, members }) => answer !== "yes" || (members && members.length > 0))

        return basicQuestionsComplete && snapQuestionsComplete && memberSelectionsValid
      case 7:
        const showNursingQuestion = applicationData.benefitType === "medicaid" || applicationData.benefitType === "both"
        return !showNursingQuestion || applicationData.healthDisability.needsNursingServices !== ""
      default:
        return true
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BenefitSelection
            selectedBenefits={applicationData.benefitType}
            onBenefitSelect={(benefitType) => updateApplicationData({ benefitType })}
            submittedApplications={submittedApplications}
          />
        )
      case 1:
        return (
          <StateSelection
            selectedState={applicationData.state}
            onStateSelect={(state) => {
              updateApplicationData({
                state,
                personalInfo: {
                  ...applicationData.personalInfo,
                  address: {
                    ...applicationData.personalInfo.address,
                    state: state,
                  },
                },
              })
            }}
          />
        )
      case 2:
        return (
          <PersonalInformationForm
            ref={personalInfoRef}
            personalInfo={applicationData.personalInfo}
            onUpdate={(personalInfo) => updateApplicationData({ personalInfo })}
          />
        )
      case 3:
        return (
          <HouseholdManagement
            householdMembers={applicationData.householdMembers}
            onUpdate={(householdMembers) => updateApplicationData({ householdMembers })}
          />
        )
      case 4:
        return (
          <HouseholdQuestions
            data={applicationData.householdQuestions}
            benefitTypes={[applicationData.benefitType]}
            householdMembers={applicationData.householdMembers}
            applicantName={
              `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`.trim() || "Applicant"
            }
            onUpdate={(householdQuestions) => updateApplicationData({ householdQuestions })}
          />
        )
      case 5:
        return (
          <IncomeEmploymentForm
            data={applicationData.incomeEmployment}
            householdMembers={applicationData.householdMembers}
            applicantName={
              `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`.trim() || "Applicant"
            }
            onUpdate={(incomeEmployment) => updateApplicationData({ incomeEmployment })}
          />
        )
      case 6:
        return (
          <AssetsForm
            data={applicationData.assets}
            householdMembers={applicationData.householdMembers}
            applicantName={
              `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`.trim() || "Applicant"
            }
            onUpdate={(assets) => updateApplicationData({ assets })}
          />
        )
      case 7:
        return (
          <HealthDisabilityForm
            data={applicationData.healthDisability}
            householdMembers={applicationData.householdMembers}
            applicantName={
              `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`.trim() || "Applicant"
            }
            benefitType={applicationData.benefitType}
            onUpdate={(healthDisability) => updateApplicationData({ healthDisability })}
          />
        )
      case 8:
        return <ReviewSubmission applicationData={applicationData} onSubmit={handleSubmit} onEdit={goToStep} />
      default:
        return null
    }
  }

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100

  const allApplicationsSubmitted =
    submittedApplications.includes("both") ||
    (submittedApplications.includes("medicaid") && submittedApplications.includes("snap"))

  console.log("🔍 Submitted applications:", submittedApplications)
  console.log("🔍 All applications submitted?", allApplicationsSubmitted)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-2 sm:mb-4 leading-tight">
                {allApplicationsSubmitted ? "Application Status" : "Benefits Application"}
              </h1>
              {allApplicationsSubmitted ? (
                <p className="text-lg sm:text-xl text-gray-600">Review your submitted applications</p>
              ) : (
                <p className="text-lg sm:text-xl text-gray-600">Complete your Medicaid and SNAP application</p>
              )}
            </div>
          </div>
        </div>

        {!allApplicationsSubmitted && (
          <>
            <div className="mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <span className="text-lg font-semibold text-gray-900">
                    Step {currentStep + 1} of {STEPS.length}
                  </span>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 sm:px-4 py-2 shadow-sm">
                    <span className="text-green-600">💾</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Progress saved automatically</span>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-medium text-gray-600 self-start sm:self-auto">
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2 sm:h-3 bg-gray-100 rounded-full" />
            </div>

            <div className="mb-8 sm:mb-12">
              <div className="flex justify-center">
                <div className="w-full overflow-x-auto">
                  <div className="flex items-center space-x-2 sm:space-x-3 pb-4 px-2 min-w-max sm:justify-center">
                    {STEPS.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center ${index < STEPS.length - 1 ? "mr-3 sm:mr-6" : ""}`}
                      >
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 hover:scale-110 shadow-md touch-manipulation ${
                            index < currentStep
                              ? "bg-gradient-to-br from-primary to-primary/80 text-white hover:shadow-lg"
                              : index === currentStep
                                ? "bg-gradient-to-br from-secondary to-secondary/80 text-white hover:shadow-lg ring-2 ring-primary/20"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                          }`}
                          onClick={() => goToStep(index)}
                        >
                          {index < currentStep ? "✓" : index + 1}
                        </div>
                        <div className="ml-2 sm:ml-3 hidden md:block">
                          <div
                            className={`text-sm font-semibold cursor-pointer hover:text-primary transition-colors duration-200 ${
                              index <= currentStep ? "text-gray-900" : "text-gray-500"
                            }`}
                            onClick={() => goToStep(index)}
                          >
                            {step.title}
                          </div>
                        </div>
                        {index < STEPS.length - 1 && (
                          <div className="w-8 sm:w-16 h-0.5 bg-gray-200 ml-3 sm:ml-6 hidden md:block"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Card className="shadow-xl border-gray-200 bg-white rounded-xl sm:rounded-2xl overflow-hidden">
          {!allApplicationsSubmitted && (
            <CardHeader className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <CardTitle className="text-xl sm:text-2xl font-heading font-bold text-gray-900 leading-tight">
                {STEPS[currentStep].title}
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 mt-2 leading-relaxed">
                {STEPS[currentStep].description}
              </CardDescription>
            </CardHeader>
          )}
          <CardContent className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{renderCurrentStep()}</CardContent>
        </Card>

        {currentStep < 8 && !allApplicationsSubmitted && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-8 sm:mt-12">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center justify-center gap-2 px-6 py-4 sm:py-3 text-base font-medium border-2 border-gray-300 hover:border-primary/50 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
            >
              <span>←</span>
              Previous
            </Button>
            <Button
              onClick={nextStep}
              disabled={currentStep === STEPS.length - 1 || !canProceed()}
              className="flex items-center justify-center gap-2 px-8 py-4 sm:py-3 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
            >
              Next
              <span>→</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
