"use client"

import type React from "react"
import { loadApplicationProgress } from "@/lib/actions" // Import the missing function

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BenefitSelection } from "@/components/benefit-selection"
import { StateSelection } from "@/components/state-selection"
import { PersonalInformationForm } from "@/components/personal-information-form"
import { HouseholdManagement } from "@/components/household-management"
import HouseholdQuestions from "@/components/household-questions"
import { IncomeEmploymentForm } from "@/components/income-employment-form"
import { AssetsForm } from "@/components/assets-form"
import { HealthDisabilityForm } from "@/components/health-disability-form"
import { ReviewSubmission } from "@/components/review-submission"
import { saveApplicationProgress } from "@/lib/actions"
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

export default function BenefitsApplicationClient({
  startFresh = false,
  continueId = null,
}: { startFresh?: boolean; continueId?: string | null }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [submittedApplications, setSubmittedApplications] = useState<string[]>([])
  const [isInitializing, setIsInitializing] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const personalInfoRef = useRef(null)
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
      employment: [],
      income: [],
      expenses: [],
      taxFilingStatus: "",
    },
    assets: {
      assets: [],
    },
    healthDisability: {
      healthInsurance: [],
      disabilities: { hasDisabled: "" },
      pregnancyInfo: { isPregnant: "" },
      medicalConditions: { hasChronicConditions: "" },
      medicalBills: { hasRecentBills: false },
      needsNursingServices: "",
    },
    additionalInfo: {
      additionalInfo: "",
    },
  })
  const stepParam = searchParams.get("step")
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      if (startFresh) {
        return
      }

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          return
        }

        let result
        if (continueId) {
          // Load specific application by ID
          result = await loadApplicationProgress(continueId)
        } else {
          // Load most recent application for this user
          result = await loadApplicationProgress()
        }

        if (result?.data) {
          const { applicationData: loadedData, currentStep: loadedStep, applicationId: loadedId } = result.data

          if (continueId) {
            // Loading specific application
            const applications = await supabase
              .from("application_progress")
              .select("*")
              .eq("id", continueId)
              .eq("user_id", user.id)

            if (applications.data && applications.data.length > 0) {
              const specificApp = applications.data[0]

              const loadedData = specificApp.application_data || {}

              const defaultData = {
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
                  employment: [],
                  income: [],
                  expenses: [],
                  taxFilingStatus: "",
                },
                assets: {
                  assets: [],
                },
                healthDisability: {
                  healthInsurance: [],
                  disabilities: { hasDisabled: "" },
                  pregnancyInfo: { isPregnant: "" },
                  medicalConditions: { hasChronicConditions: "" },
                  medicalBills: { hasRecentBills: false },
                  needsNursingServices: "",
                },
                additionalInfo: {
                  additionalInfo: "",
                },
              }

              // Safely merge loaded data with defaults
              const mergedData = {
                ...defaultData,
                ...loadedData,
                personalInfo: {
                  ...defaultData.personalInfo,
                  ...(loadedData.personalInfo || {}),
                  address: {
                    ...defaultData.personalInfo.address,
                    ...(loadedData.personalInfo?.address || {}),
                  },
                },
                householdQuestions: {
                  ...defaultData.householdQuestions,
                  ...(loadedData.householdQuestions || {}),
                },
                incomeEmployment: {
                  ...defaultData.incomeEmployment,
                  ...(loadedData.incomeEmployment || {}),
                },
                assets: {
                  ...defaultData.assets,
                  ...(loadedData.assets || {}),
                },
                healthDisability: {
                  ...defaultData.healthDisability,
                  ...(loadedData.healthDisability || {}),
                  disabilities: {
                    ...defaultData.healthDisability.disabilities,
                    ...(loadedData.healthDisability?.disabilities || {}),
                  },
                  pregnancyInfo: {
                    ...defaultData.healthDisability.pregnancyInfo,
                    ...(loadedData.healthDisability?.pregnancyInfo || {}),
                  },
                  medicalConditions: {
                    ...defaultData.healthDisability.medicalConditions,
                    ...(loadedData.healthDisability?.medicalConditions || {}),
                  },
                  medicalBills: {
                    ...defaultData.healthDisability.medicalBills,
                    ...(loadedData.healthDisability?.medicalBills || {}),
                  },
                },
                additionalInfo: {
                  ...defaultData.additionalInfo,
                  ...(loadedData.additionalInfo || {}),
                },
              }

              setApplicationData(mergedData)
              setCurrentStep(specificApp.current_step)
              setApplicationId(specificApp.id)
              setIsLoading(false)
              return
            }
          } else {
            const defaultData = {
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
                employment: [],
                income: [],
                expenses: [],
                taxFilingStatus: "",
              },
              assets: {
                assets: [],
              },
              healthDisability: {
                healthInsurance: [],
                disabilities: { hasDisabled: "" },
                pregnancyInfo: { isPregnant: "" },
                medicalConditions: { hasChronicConditions: "" },
                medicalBills: { hasRecentBills: false },
                needsNursingServices: "",
              },
              additionalInfo: {
                additionalInfo: "",
              },
            }

            const mergedData = {
              ...defaultData,
              ...loadedData,
              personalInfo: {
                ...defaultData.personalInfo,
                ...(loadedData.personalInfo || {}),
                address: {
                  ...defaultData.personalInfo.address,
                  ...(loadedData.personalInfo?.address || {}),
                },
              },
              householdQuestions: {
                ...defaultData.householdQuestions,
                ...(loadedData.householdQuestions || {}),
              },
              incomeEmployment: {
                ...defaultData.incomeEmployment,
                ...(loadedData.incomeEmployment || {}),
              },
              assets: {
                ...defaultData.assets,
                ...(loadedData.assets || {}),
              },
              healthDisability: {
                ...defaultData.healthDisability,
                ...(loadedData.healthDisability || {}),
                disabilities: {
                  ...defaultData.healthDisability.disabilities,
                  ...(loadedData.healthDisability?.disabilities || {}),
                },
                pregnancyInfo: {
                  ...defaultData.healthDisability.pregnancyInfo,
                  ...(loadedData.healthDisability?.pregnancyInfo || {}),
                },
                medicalConditions: {
                  ...defaultData.healthDisability.medicalConditions,
                  ...(loadedData.healthDisability?.medicalConditions || {}),
                },
                medicalBills: {
                  ...defaultData.healthDisability.medicalBills,
                  ...(loadedData.healthDisability?.medicalBills || {}),
                },
              },
              additionalInfo: {
                ...defaultData.additionalInfo,
                ...(loadedData.additionalInfo || {}),
              },
            }

            setApplicationData(mergedData)
            setCurrentStep(loadedStep)
            setApplicationId(loadedId)
          }
        } else {
        }
      } catch (error) {
        console.error("Error loading saved progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedProgress()
  }, [startFresh, continueId])

  useEffect(() => {
    const autoSave = async () => {
      if (applicationData.benefitType && applicationData.benefitType !== "" && currentStep > 0 && !isLoading) {
        try {
          const result = await saveApplicationProgress(applicationData, currentStep, applicationId)
          if (result.success && result.applicationId && !applicationId) {
            setApplicationId(result.applicationId)
          }
        } catch (error) {
          console.error("Auto-save failed:", error)
        }
      } else {
      }
    }

    const timeoutId = setTimeout(autoSave, 2000)
    return () => clearTimeout(timeoutId)
  }, [applicationData, currentStep, isLoading, isInitializing, applicationId])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (applicationData.benefitType && applicationData.benefitType !== "" && currentStep > 0) {
        saveApplicationProgress(applicationData, currentStep, applicationId)
        e.preventDefault()
        e.returnValue = ""
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && applicationData.benefitType && applicationData.benefitType !== "" && currentStep > 0) {
        saveApplicationProgress(applicationData, currentStep, applicationId)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [applicationData, currentStep, applicationId])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getStepCompletionPercentage = (stepIndex: number) => {
        switch (stepIndex) {
          case 0:
            return applicationData.benefitType ? 100 : 0
          case 1:
            return applicationData.state ? 100 : 0
          case 2: {
            const { personalInfo } = applicationData
            const requiredFields = [
              personalInfo.applyingFor,
              personalInfo.firstName,
              personalInfo.lastName,
              personalInfo.dateOfBirth,
              personalInfo.languagePreference,
              personalInfo.address.street,
              personalInfo.address.city,
              personalInfo.address.zipCode,
              personalInfo.phone,
              personalInfo.email,
              personalInfo.citizenshipStatus,
              personalInfo.socialSecurityNumber,
            ]
            const completedFields = requiredFields.filter((field) => field && field.toString().trim() !== "").length
            return Math.round((completedFields / requiredFields.length) * 100)
          }
          case 3:
            return applicationData.householdMembers.length > 0 ? 100 : 0
          case 4: {
            const { householdQuestions } = applicationData
            const isApplyingForSNAP = applicationData.benefitType === "snap" || applicationData.benefitType === "both"
            const basicQuestions = [
              householdQuestions.appliedWithDifferentInfo,
              householdQuestions.appliedInOtherState,
              householdQuestions.receivedBenefitsBefore,
            ]
            const snapQuestions = isApplyingForSNAP
              ? [
                  householdQuestions.receivingSNAPThisMonth,
                  householdQuestions.disqualifiedFromBenefits,
                  householdQuestions.wantSomeoneElseToReceiveSNAP,
                ]
              : []
            const allQuestions = [...basicQuestions, ...snapQuestions]
            const completedQuestions = allQuestions.filter((q) => q && q !== "").length
            return allQuestions.length > 0 ? Math.round((completedQuestions / allQuestions.length) * 100) : 0
          }
          case 5: {
            const { incomeEmployment } = applicationData
            const hasEmployment = incomeEmployment.employment && incomeEmployment.employment.length > 0
            const hasIncome = incomeEmployment.income && incomeEmployment.income.length > 0
            const hasExpenses = incomeEmployment.expenses && incomeEmployment.expenses.length > 0
            const hasTaxStatus = incomeEmployment.taxFilingStatus && incomeEmployment.taxFilingStatus !== ""
            const completedSections = [hasEmployment, hasIncome, hasExpenses, hasTaxStatus].filter(Boolean).length
            return Math.round((completedSections / 4) * 100)
          }
          case 6: {
            const { assets } = applicationData
            return assets.assets && assets.assets.length > 0 ? 100 : 50
          }
          case 7: {
            const { healthDisability } = applicationData
            const showNursingQuestion =
              applicationData.benefitType === "medicaid" || applicationData.benefitType === "both"
            return showNursingQuestion ? (healthDisability.needsNursingServices ? 100 : 0) : 100
          }
          case 8:
            return 100
          default:
            return 0
        }
      }

      const getValidationErrors = () => {
        const errors: string[] = []
        switch (currentStep) {
          case 0:
            if (!applicationData.benefitType) errors.push("Benefit type selection required")
            break
          case 1:
            if (!applicationData.state) errors.push("State selection required")
            break
          case 2:
            const { personalInfo } = applicationData
            if (!personalInfo.applyingFor) errors.push("Application type required")
            if (!personalInfo.firstName.trim()) errors.push("First name required")
            if (!personalInfo.lastName.trim()) errors.push("Last name required")
            if (!personalInfo.dateOfBirth) errors.push("Date of birth required")
            if (!personalInfo.languagePreference) errors.push("Language preference required")
            if (!personalInfo.address.street.trim()) errors.push("Street address required")
            if (!personalInfo.address.city.trim()) errors.push("City required")
            if (!personalInfo.address.zipCode.trim()) errors.push("ZIP code required")
            if (!personalInfo.phone.trim()) errors.push("Phone number required")
            if (!personalInfo.email.trim()) errors.push("Email address required")
            if (!personalInfo.citizenshipStatus) errors.push("Citizenship status required")
            if (!personalInfo.socialSecurityNumber.trim()) errors.push("Social Security Number required")
            break
          case 4:
            const { householdQuestions } = applicationData
            if (!householdQuestions.appliedWithDifferentInfo) errors.push("Previous application question required")
            if (!householdQuestions.appliedInOtherState) errors.push("Other state application question required")
            if (!householdQuestions.receivedBenefitsBefore) errors.push("Previous benefits question required")
            const isApplyingForSNAP = applicationData.benefitType === "snap" || applicationData.benefitType === "both"
            if (isApplyingForSNAP) {
              if (!householdQuestions.receivingSNAPThisMonth) errors.push("Current SNAP benefits question required")
              if (!householdQuestions.disqualifiedFromBenefits) errors.push("Disqualification question required")
              if (!householdQuestions.wantSomeoneElseToReceiveSNAP)
                errors.push("Authorized representative question required")
            }
            break
          case 7:
            const showNursingQuestion =
              applicationData.benefitType === "medicaid" || applicationData.benefitType === "both"
            if (showNursingQuestion && !applicationData.healthDisability.needsNursingServices) {
              errors.push("Nursing services question required")
            }
            break
        }
        return errors
      }

      const getNextRequiredSteps = () => {
        const nextSteps: string[] = []
        for (let i = currentStep + 1; i < STEPS.length; i++) {
          if (getStepCompletionPercentage(i) < 100) {
            nextSteps.push(STEPS[i].title)
            if (nextSteps.length >= 3) break
          }
        }
        return nextSteps
      }
      ;(window as any).applicationContext = {
        currentStep,
        stepTitle: STEPS[currentStep]?.title,
        stepDescription: STEPS[currentStep]?.description,
        stepId: STEPS[currentStep]?.id,
        completedSteps: currentStep,
        totalSteps: STEPS.length,
        progressPercentage: Math.round(((currentStep + 1) / STEPS.length) * 100),
        canProceed: canProceed(),
        currentStepCompletion: getStepCompletionPercentage(currentStep),
        allStepCompletions: STEPS.map((_, index) => ({
          step: index,
          title: STEPS[index].title,
          completion: getStepCompletionPercentage(index),
        })),
        validationErrors: getValidationErrors(),
        hasValidationErrors: getValidationErrors().length > 0,
        nextRequiredSteps: getNextRequiredSteps(),
        applicationData: {
          benefitType: applicationData.benefitType,
          state: applicationData.state,
          personalInfo: applicationData.personalInfo,
          householdSize: applicationData.householdMembers.length + 1,
          householdMembers: applicationData.householdMembers,
          hasEmployment: applicationData.incomeEmployment.employment?.length > 0,
          hasOtherIncome: applicationData.incomeEmployment.income?.length > 0,
          hasExpenses: applicationData.incomeEmployment.expenses?.length > 0,
          taxFilingStatus: applicationData.incomeEmployment.taxFilingStatus,
          hasAssets: applicationData.assets.assets?.length > 0,
          assetCount: applicationData.assets.assets?.length || 0,
          hasHealthInsurance: applicationData.healthDisability.healthInsurance?.length > 0,
          hasDisabilities: applicationData.healthDisability.disabilities?.hasDisabled,
          isPregnant: applicationData.healthDisability.pregnancyInfo?.isPregnant,
          hasChronicConditions: applicationData.healthDisability.medicalConditions?.hasChronicConditions,
          needsNursingServices: applicationData.healthDisability.needsNursingServices,
          hasRecentMedicalBills: applicationData.healthDisability.medicalBills?.hasRecentBills,
        },
        userProfile: {
          name:
            `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`.trim() || "Applicant",
          email: applicationData.personalInfo.email,
          phone: applicationData.personalInfo.phone,
          address: applicationData.personalInfo.address,
          language: applicationData.personalInfo.languagePreference,
          citizenship: applicationData.personalInfo.citizenshipStatus,
        },
        documentStatus: {
          uploaded: [],
          required: [],
          missing: [],
        },
        metadata: {
          lastSaved: new Date().toISOString(),
          isLoading,
          isSaving,
          isInitializing,
          submittedApplications,
          allApplicationsSubmitted:
            submittedApplications.includes("both") ||
            (submittedApplications.includes("medicaid") && submittedApplications.includes("snap")),
        },
      }
    }
  }, [currentStep, applicationData, isLoading, isSaving, isInitializing, submittedApplications])

  const updateApplicationData = (updates: any) => {
    setApplicationData((prev) => ({ ...prev, ...updates }))

    if (!isInitializing) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const updatedData = { ...applicationData, ...updates }
          if (currentStep >= 0 && updatedData.benefitType && updatedData.benefitType !== "") {
            await saveApplicationProgress(updatedData, currentStep, applicationId)
          }
        } catch (error) {
          console.error("Form change save error:", error)
        }
      }, 3000)
    }
  }

  useEffect(() => {
    ;(window as any).updateApplicationData = updateApplicationData

    return () => {
      delete (window as any).updateApplicationData
    }
  }, [])

  const nextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      setIsTransitioning(true)
      setSwipeDirection("left")

      try {
        if (applicationData.benefitType && applicationData.benefitType !== "") {
          const result = await saveApplicationProgress(applicationData, currentStep + 1, applicationId)
        }
      } catch (error) {
        console.error("Step change save error:", error)
      }

      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setTimeout(() => {
          setIsTransitioning(false)
          setSwipeDirection(null)
        }, 150)
      }, 150)
    }
  }

  const prevStep = async () => {
    if (currentStep > 0) {
      setIsTransitioning(true)
      setSwipeDirection("right")

      try {
        if (applicationData.benefitType && applicationData.benefitType !== "") {
          const result = await saveApplicationProgress(applicationData, currentStep - 1, applicationId)
        }
      } catch (error) {
        console.error("Step change save error:", error)
      }

      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setTimeout(() => {
          setIsTransitioning(false)
          setSwipeDirection(null)
        }, 150)
      }, 150)
    }
  }

  const goToStep = (step: number) => {
    setIsTransitioning(true)
    setSwipeDirection(step > currentStep ? "left" : "right")

    setTimeout(() => {
      setCurrentStep(step)
      setTimeout(() => {
        setIsTransitioning(false)
        setSwipeDirection(null)
      }, 150)
    }, 150)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    console.log("Application submitted:", applicationData)
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
        employment: [],
        income: [],
        expenses: [],
        taxFilingStatus: "",
      },
      assets: {
        assets: [],
      },
      healthDisability: {
        healthInsurance: [],
        disabilities: { hasDisabled: "" },
        pregnancyInfo: { isPregnant: "" },
        medicalConditions: { hasChronicConditions: "" },
        medicalBills: { hasRecentBills: false },
        needsNursingServices: "",
      },
      additionalInfo: {
        additionalInfo: "",
      },
    })
    setCurrentStep(0)
    setApplicationId(null)
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const deltaX = touchStartX.current - touchEndX
    const deltaY = touchStartY.current - touchEndY

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentStep < STEPS.length - 1 && canProceed()) {
        nextStep()
      } else if (deltaX < 0 && currentStep > 0) {
        prevStep()
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your application...</p>
        </div>
      </div>
    )
  }

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
              <div className="flex justify-center">
                <div className="w-full overflow-x-auto scrollbar-hide">
                  <div className="flex items-center space-x-3 sm:space-x-4 pb-4 px-2 min-w-max sm:justify-center">
                    {STEPS.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center ${index < STEPS.length - 1 ? "mr-4 sm:mr-6" : ""}`}
                      >
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-sm sm:text-base font-bold cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl touch-manipulation active:scale-95 ${
                            index < currentStep
                              ? "bg-gradient-to-br from-primary via-primary to-primary/80 text-white hover:shadow-primary/25 ring-2 ring-primary/10"
                              : index === currentStep
                                ? "bg-gradient-to-br from-secondary via-secondary to-secondary/80 text-white hover:shadow-secondary/25 ring-4 ring-primary/20 animate-pulse"
                                : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => goToStep(index)}
                        >
                          {index < currentStep ? "✓" : index + 1}
                        </div>
                        <div className="ml-3 sm:ml-4 hidden md:block">
                          <div
                            className={`text-sm font-semibold cursor-pointer hover:text-primary transition-all duration-200 ${
                              index <= currentStep ? "text-gray-900" : "text-gray-500"
                            }`}
                            onClick={() => goToStep(index)}
                          >
                            {step.title}
                          </div>
                        </div>
                        {index < STEPS.length - 1 && (
                          <div
                            className={`w-8 sm:w-16 h-1 rounded-full ml-4 sm:ml-6 hidden md:block transition-all duration-500 ${
                              index < currentStep ? "bg-gradient-to-r from-primary to-primary/60" : "bg-gray-200"
                            }`}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Card
              className={`shadow-2xl border-gray-200 bg-white rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${
                isTransitioning ? "transform scale-[0.98] opacity-90" : "transform scale-100 opacity-100"
              }`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {!allApplicationsSubmitted && (
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                  <CardTitle className="text-xl sm:text-2xl font-heading font-bold text-gray-900 leading-tight">
                    {STEPS[currentStep].title}
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg text-gray-600 mt-2 leading-relaxed">
                    {STEPS[currentStep].description}
                  </CardDescription>
                  <div className="mt-4 sm:hidden">
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span>👆</span>
                      Swipe left/right to navigate between steps
                    </p>
                  </div>
                </CardHeader>
              )}
              <CardContent
                className={`px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all duration-300 ${
                  isTransitioning
                    ? swipeDirection === "left"
                      ? "transform translate-x-2 opacity-80"
                      : "transform -translate-x-2 opacity-80"
                    : "transform translate-x-0 opacity-100"
                }`}
              >
                {renderCurrentStep()}
              </CardContent>
            </Card>

            {currentStep < 8 && !allApplicationsSubmitted && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-8 sm:mt-12">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center justify-center gap-3 px-6 py-4 text-base font-semibold border-2 border-gray-300 hover:border-primary/50 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] sm:min-h-[52px] touch-manipulation active:scale-95 shadow-md hover:shadow-lg"
                >
                  <span className="text-lg">←</span>
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={currentStep === STEPS.length - 1 || !canProceed()}
                  className="flex items-center justify-center gap-3 px-8 py-4 text-base font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] sm:min-h-[52px] touch-manipulation active:scale-95 hover:scale-[1.02]"
                >
                  Next
                  <span className="text-lg">→</span>
                </Button>
              </div>
            )}
          </>
        )}

        {allApplicationsSubmitted && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200 px-6 py-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">✓</span>
                </div>
                <CardTitle className="text-2xl font-bold text-green-800 mb-2">All Applications Submitted</CardTitle>
                <CardDescription className="text-lg text-green-700">
                  Congratulations! You've successfully submitted all your benefit applications.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-8 text-center">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
                    <p className="text-gray-600 mb-4">
                      Your applications are being processed. You can track their status and view details in your
                      dashboard.
                    </p>
                    <div className="flex justify-center">
                      <Button
                        onClick={() => router.push("/account?tab=applications")}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg"
                      >
                        <span>📋</span>
                        View Application Status
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
