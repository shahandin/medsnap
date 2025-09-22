"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Translation system core functionality
export type Language = "en" | "es" | "fr" | "zh" | "ar" | "ru" | "pt" | "de" | "it" | "ja"

export interface TranslationData {
  nav: {
    about: string
    applyForBenefits: string
    dashboard: string
    signIn: string
    getStarted: string
    language: string
  }
  home: {
    trustedBy: string
    heroTitle: string
    heroTitleHighlight: string
    heroDescription: string
    applyForBenefits: string
    learnMore: string
    whyChooseTitle: string
    whyChooseDescription: string
    features: {
      comprehensive: {
        title: string
        description: string
      }
      easyApplication: {
        title: string
        description: string
      }
      securePrivate: {
        title: string
        description: string
      }
      aiEnabled: {
        title: string
        description: string
      }
    }
    cta: {
      title: string
      description: string
      startApplication: string
    }
  }
  auth: {
    signIn: {
      title: string
      subtitle: string
      email: string
      password: string
      emailPlaceholder: string
      showPassword: string
      hidePassword: string
      signingIn: string
      signInButton: string
      noAccount: string
      signUpLink: string
    }
    signUp: {
      title: string
      email: string
      password: string
      confirmPassword: string
      emailPlaceholder: string
      showPassword: string
      hidePassword: string
      creatingAccount: string
      createAccountButton: string
      hasAccount: string
      signInLink: string
      passwordRequirements: {
        minLength: string
        hasNumber: string
        hasSpecialChar: string
        passwordsMatch: string
      }
      successMessage: string
    }
    callback: {
      confirmingEmail: string
      emailConfirmed: {
        title: string
        subtitle: string
        message: string
        continueToApp: string
      }
      emailConfirmationFailed: {
        title: string
        subtitle: string
        reasons: {
          expiredLink: string
          invalidLink: string
          alreadyConfirmed: string
        }
        actions: {
          resendConfirmation: string
          contactSupport: string
          signIn: string
        }
      }
      processing: string
      redirecting: string
    }
  }
  prescreening: {
    title: string
    subtitle: string
    processingMessage: string
  }
  applicationChoice: {
    title: string
    subtitle: string
    startNew: {
      title: string
      description: string
      button: string
    }
    continueExisting: {
      title: string
      description: string
      noApplications: string
      noApplicationsButton: string
      lastSaved: string
      currentStep: string
    }
    loading: string
    medicaidApplication: string
    snapApplication: string
    bothApplication: string
    benefitsApplication: string
  }
  dashboard: {
    title: string
    welcome: string
    tabs: {
      overview: string
      applications: string
      documents: string
      notifications: string
      profile: string
      settings: string
    }
    overview: {
      quickActions: string
      recentActivity: string
      applicationStatus: string
      upcomingDeadlines: string
    }
    applications: {
      title: string
      status: {
        draft: string
        submitted: string
        underReview: string
        approved: string
        denied: string
        needsInfo: string
      }
      actions: {
        continue: string
        view: string
        edit: string
        download: string
      }
    }
    notifications: {
      title: string
      markAllRead: string
      noNotifications: string
      types: {
        application: string
        document: string
        deadline: string
        system: string
      }
    }
    profile: {
      title: string
      personalInfo: string
      contactInfo: string
      emergencyContact: string
      saveChanges: string
      changesSaved: string
    }
    settings: {
      title: string
      language: string
      notifications: string
      privacy: string
      security: string
      signOut: string
    }
  }
  forms: {
    personalInfo: {
      title: string
      subtitle: string
      firstName: string
      lastName: string
      middleName: string
      dateOfBirth: string
      ssn: string
      phone: string
      email: string
      address: string
      city: string
      state: string
      zipCode: string
      county: string
      required: string
      optional: string
    }
    household: {
      title: string
      subtitle: string
      householdSize: string
      addMember: string
      removeMember: string
      relationship: string
      relationships: {
        spouse: string
        child: string
        parent: string
        sibling: string
        other: string
      }
    }
    income: {
      title: string
      subtitle: string
      employmentStatus: string
      employer: string
      jobTitle: string
      monthlyIncome: string
      hourlyWage: string
      hoursPerWeek: string
      addIncomeSource: string
      removeIncomeSource: string
      incomeTypes: {
        employment: string
        selfEmployment: string
        unemployment: string
        socialSecurity: string
        disability: string
        pension: string
        other: string
      }
    }
    assets: {
      title: string
      subtitle: string
      currentAssets: string
      addNewAsset: string
      addFinancialAsset: string
      addVehicle: string
      addLifeInsurance: string
      assetOwner: string
      accountType: string
      bankName: string
      currentBalance: string
      vehicleType: string
      make: string
      model: string
      year: string
      estimatedValue: string
      policyType: string
      insuranceCompany: string
      faceValue: string
      cashValue: string
      noAssetsMessage: string
      noAssetsNote: string
    }
    health: {
      title: string
      subtitle: string
      healthInsuranceSection: string
      healthInsuranceDescription: string
      pregnancySection: string
      pregnancyDescription: string
      disabilitySection: string
      disabilityDescription: string
      addInsurance: string
      addPregnancy: string
      addDisability: string
      hasInsurance: string
      insuranceProvider: string
      insuranceProviderPlaceholder: string
      policyNumber: string
      policyNumberPlaceholder: string
      groupNumber: string
      groupNumberPlaceholder: string
      coverageType: string
      monthlyPremium: string
      monthlyPremiumPlaceholder: string
      insuranceTypes: {
        employer: string
        marketplace: string
        medicaid: string
        medicare: string
        private: string
        other: string
      }
      isPregnant: string
      whoIsPregnant: string
      selectHouseholdMember: string
      dueDate: string
      dueDatePlaceholder: string
      hasDisability: string
      disabilityDetails: string
      disabilityDetailsPlaceholder: string
      disabilityType: string
      disabilityTypes: {
        physical: string
        mental: string
        intellectual: string
        sensory: string
        chronic: string
        other: string
      }
      needsAssistance: string
      assistanceDetails: string
      assistanceDetailsPlaceholder: string
      assistanceType: string
      assistanceTypes: {
        personal: string
        mobility: string
        communication: string
        cognitive: string
        medical: string
        other: string
      }
      isIncarcerated: string
      incarcerationDetails: string
      incarcerationDetailsPlaceholder: string
      medicalConditionsTitle: string
      medicalConditionsDescription: string
      hasChronicConditions: string
      selectAllThatApply: string
      additionalDetails: string
      additionalDetailsPlaceholder: string
      medicalBillsTitle: string
      medicalBillsDescription: string
      hasRecentBills: string
      billDetails: string
      billDetailsPlaceholder: string
      billDetailsNote: string
      longTermCareTitle: string
      longTermCareDescription: string
      needsNursingServices: string
      yesNursingServices: string
      noNursingServices: string
      nursingServicesNote: string
      noInsurance: string
      noPregnancy: string
      noDisability: string
      healthNote: string
    }
    applicationContext: {
      title: string
      subtitle: string
      applyingFor: string
      myself: string
      someoneElse: string
      note: string
    }
    basicInformation: {
      title: string
      subtitle: string
      firstNamePlaceholder: string
      lastNamePlaceholder: string
      languagePreference: string
      languagePreferencePlaceholder: string
      languageNote: string
    }
    addressInformation: {
      title: string
      subtitle: string
      streetPlaceholder: string
      cityPlaceholder: string
      statePlaceholder: string
      zipCodePlaceholder: string
    }
    contactInformation: {
      title: string
      subtitle: string
      phonePlaceholder: string
      emailPlaceholder: string
    }
    legalInformation: {
      title: string
      subtitle: string
      citizenshipStatus: string
      citizenshipStatusPlaceholder: string
      ssnPlaceholder: string
      ssnNote: string
      citizenshipOptions: {
        usCitizen: string
        permanentResident: string
        refugee: string
        asylee: string
        otherQualified: string
      }
    }
    incomeEmployment: {
      title: string
      subtitle: string
      employmentSection: string
      incomeSection: string
      expensesSection: string
      addEmployment: string
      addIncome: string
      addExpense: string
      memberName: string
      employmentStatus: string
      employmentStatusOptions: {
        employed: string
        selfEmployed: string
        unemployed: string
        retired: string
        disabled: string
        student: string
        homemaker: string
      }
      employer: string
      employerPlaceholder: string
      jobTitle: string
      jobTitlePlaceholder: string
      monthlyIncome: string
      monthlyIncomePlaceholder: string
      hoursPerWeek: string
      hoursPerWeekPlaceholder: string
      incomeType: string
      incomeTypes: {
        wages: string
        selfEmployment: string
        unemployment: string
        socialSecurity: string
        disability: string
        pension: string
        childSupport: string
        alimony: string
        rental: string
        investment: string
        capitalGains: string
        dividends: string
        other: string
      }
      amount: string
      amountPlaceholder: string
      frequency: string
      frequencies: {
        weekly: string
        biweekly: string
        monthly: string
        quarterly: string
        yearly: string
      }
      expenseType: string
      expenseTypes: {
        rent: string
        mortgage: string
        propertyTax: string
        homeownersInsurance: string
        utilities: string
        hoaFees: string
        maintenance: string
        medicalExpenses: string
        childcare: string
        dependentCare: string
        studentLoan: string
        alimonyPaid: string
        business: string
        otherDeductible: string
        transportation: string
        other: string
      }
      description: string
      descriptionPlaceholder: string
      noEmployment: string
      noIncome: string
      noExpenses: string
      employmentNote: string
      taxFilingStatus: string
      taxFilingStatusPlaceholder: string
      taxFilingDescription: string
      taxFilingOptions: {
        single: string
        marriedFilingJointly: string
        marriedFilingSeparately: string
        headOfHousehold: string
        qualifyingWidow: string
      }
      employmentDescription: string
      incomeDescription: string
      you: string
      employmentEntries: string
      addJob: string
      noEmploymentAdded: string
      clickAddEmployment: string
      jobNumber: string
      selectStatus: string
      incomeSources: string
      addMore: string
      noIncomeAdded: string
      clickAddIncome: string
      incomeSource: string
      selectType: string
      housingExpensesTitle: string
      housingExpensesDescription: string
      addHousingExpensesNote: string
      addHousingExpense: string
      noHousingExpenses: string
      clickAddHousingExpense: string
      selectExpenseType: string
      taxDeductibleExpensesTitle: string
      taxDeductibleExpensesDescription: string
      taxFilingTitle: string
      employmentTitle: string
      incomeTitle: string
      expensesTitle: string
      stepIndicator: string
      finalStepMessage: string
    }
    assetTypes: {
      financial: string
      vehicle: string
      lifeInsurance: string
    }
    assetOwnerPlaceholder: string
    accountTypes: {
      checking: string
      savings: string
      moneyMarket: string
      cd: string
      investment: string
      cash: string
      other: string
    }
    bankNamePlaceholder: string
    balancePlaceholder: string
    vehicleTypes: {
      car: string
      truck: string
      motorcycle: string
      van: string
      suv: string
      rv: string
      boat: string
      otherVehicle: string
    }
    makePlaceholder: string
    modelPlaceholder: string
    yearPlaceholder: string
    valueNote: string
    policyTypes: {
      term: string
      whole: string
      universal: string
      variable: string
      otherInsurance: string
    }
    insuranceCompanyPlaceholder: string
    faceValueLabel: string
    cashValueNote: string
  }
  chat: {
    title: string
    subtitle: string
    placeholder: string
    stepPlaceholder: string
    welcomeMessage: string
    quickHelp: string
    navigating: string
    technicalDifficulties: string
    couldNotProcess: string
    noResponse: string
    contexts: {
      homepage: string
      aboutPage: string
      accountDashboard: string
      benefitsApplication: string
      benefitsAccess: string
    }
    stepContext: string
  }
  notifications: {
    title: string
    viewAll: string
    mockNotifications: {
      applicationSaved: {
        title: string
        summary: string
      }
      documentRequired: {
        title: string
        summary: string
      }
      applicationSubmitted: {
        title: string
        summary: string
      }
    }
    timestamps: {
      hoursAgo: string
      dayAgo: string
      daysAgo: string
    }
  }
  about: {
    hero: {
      title: string
      subtitle: string
    }
    mission: {
      title: string
      subtitle: string
      bridgingGap: {
        title: string
        description1: string
        description2: string
      }
      peopleFirst: {
        title: string
        description: string
      }
    }
    services: {
      title: string
      subtitle: string
      medicaid: {
        title: string
        description: string
      }
      snap: {
        title: string
        description: string
      }
      secure: {
        title: string
        description: string
      }
      tracking: {
        title: string
        description: string
      }
      support: {
        title: string
        description: string
      }
      management: {
        title: string
        description: string
      }
    }
    howItWorks: {
      title: string
      subtitle: string
      step1: {
        title: string
        description: string
      }
      step2: {
        title: string
        description: string
      }
      step3: {
        title: string
        description: string
      }
    }
    cta: {
      title: string
      subtitle: string
      startApplication: string
      contactSupport: string
    }
  }
  success: {
    applicationSubmitted: {
      title: string
      subtitle: string
      confirmationNumber: string
      whatHappensNext: string
      steps: {
        review: {
          title: string
          description: string
          timeframe: string
        }
        verification: {
          title: string
          description: string
          timeframe: string
        }
        decision: {
          title: string
          description: string
          timeframe: string
        }
      }
      importantInfo: {
        title: string
        checkEmail: string
        keepDocuments: string
        contactUs: string
      }
      actions: {
        viewDashboard: string
        printConfirmation: string
        startNewApplication: string
      }
      estimatedProcessingTime: string
    }
    accountCreated: {
      title: string
      subtitle: string
      nextSteps: {
        title: string
        completeProfile: string
        startApplication: string
        exploreResources: string
      }
      getStarted: string
    }
  }
  errors: {
    general: {
      somethingWentWrong: string
      networkError: string
      serverError: string
      unexpectedError: string
      sessionExpired: string
      accessDenied: string
      pageNotFound: string
      serviceUnavailable: string
    }
    auth: {
      invalidCredentials: string
      emailNotConfirmed: string
      accountLocked: string
      passwordTooWeak: string
      emailAlreadyExists: string
      emailNotFound: string
      invalidEmailFormat: string
      passwordMismatch: string
      signUpFailed: string
      signInFailed: string
      signOutFailed: string
      resetPasswordFailed: string
      confirmationFailed: string
      resendConfirmationFailed: string
    }
    validation: {
      required: string
      invalidEmail: string
      invalidPhone: string
      invalidSSN: string
      invalidZipCode: string
      invalidDate: string
      minLength: string
      maxLength: string
      mustBeNumber: string
      mustBePositive: string
      invalidFormat: string
    }
    application: {
      saveFailed: string
      submitFailed: string
      loadFailed: string
      deleteFailed: string
      uploadFailed: string
      invalidFileType: string
      fileTooLarge: string
      missingRequiredFields: string
      applicationNotFound: string
    }
    database: {
      connectionFailed: string
      queryFailed: string
      updateFailed: string
      createFailed: string
      deleteFailed: string
    }
  }
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    save: string
    continue: string
    back: string
    next: string
    submit: string
    close: string
    edit: string
    delete: string
    remove: string
    add: string
    yes: string
    no: string
    optional: string
    required: string
    selectOption: string
    pleaseSelect: string
    tryAgain: string
    retry: string
  }
  benefitSelection: {
    medicaidOnly: string
    medicaidDescription: string
    medicaidDetails: string
    snapOnly: string
    snapDescription: string
    snapDetails: string
    bothBenefits: string
    bothDescription: string
    bothDetails: string
    medicaid: string
    snap: string
    alreadySubmittedBoth: string
    cannotApplyBothAfterIndividual: string
    alreadySubmittedSingle: string
    applicationStatus: string
    allApplicationsSubmitted: string
    applicationsSubmittedTitle: string
    applicationsUnderReview: string
    reviewNotification: string
    viewApplications: string
    whatHappensNext: string
    reviewWithin30Days: string
    mayContactForDocs: string
    checkAccountRegularly: string
    receiveNotification: string
    whatBenefitsApplying: string
    selectAssistanceType: string
    importantInformation: string
    canApplyBoth: string
    differentRequirements: string
    increasesChances: string
  }
  stateSelection: {
    title: string
    description: string
    stateOfResidence: string
    searchPlaceholder: string
    selected: string
  }
  householdManagement: {
    title: string
    description: string
    currentMembers: string
    peopleIncluded: string
    born: string
    addMemberTitle: string
    addMemberDescription: string
    firstName: string
    lastName: string
    dateOfBirth: string
    relationshipToYou: string
    socialSecurityNumber: string
    firstNamePlaceholder: string
    lastNamePlaceholder: string
    selectRelationship: string
    ssnPlaceholder: string
    ssnNote: string
    addMember: string
    noMembersAdded: string
    membersAdded: string
    whoToIncludeTitle: string
    whoToIncludeDescription: string
    relationships: {
      grandparent: string
      grandchild: string
      otherRelative: string
      unrelated: string
    }
  }
  householdQuestions: {
    title: string
    subtitle: string
    appliedWithDifferentInfo: string
    appliedWithDifferentInfoDescription: string
    appliedInOtherState: string
    appliedInOtherStateDescription: string
    receivedBenefitsBefore: string
    receivedBenefitsBeforeDescription: string
    receivingSNAPThisMonth: string
    receivingSNAPThisMonthDescription: string
    disqualifiedFromBenefits: string
    disqualifiedFromBenefitsDescription: string
    wantSomeoneElseToReceiveSNAP: string
    wantSomeoneElseToReceiveSNAPDescription: string
    selectHouseholdMembers: string
    applicant: string
    snapSpecificQuestions: string
    snapSpecificQuestionsDescription: string
  }
  progressSteps: {
    benefitSelection: string
    benefitSelectionDesc: string
    stateSelection: string
    stateSelectionDesc: string
    personalInformation: string
    personalInformationDesc: string
    householdMembers: string
    householdMembersDesc: string
    householdQuestions: string
    householdQuestionsDesc: string
    incomeExpenses: string
    incomeExpensesDesc: string
    assets: string
    assetsDesc: string
    healthDisability: string
    healthDisabilityDesc: string
    reviewSubmit: string
    reviewSubmitDesc: string
    loadingApplication: string
    benefitsApplication: string
    completeMedicaidSNAP: string
    applicationStatus: string
    reviewSubmittedApplications: string
    allApplicationsSubmitted: string
    congratulationsMessage: string
    whatsNext: string
    applicationsBeingProcessed: string
    viewApplicationStatus: string
    swipeNavigation: string
  }
  forms: {
    healthDisability: {
      title: string
      subtitle: string
      healthInsuranceSection: string
      healthInsuranceDescription: string
      addInsurance: string
      hasInsurance: string
      insuranceProvider: string
      insuranceProviderPlaceholder: string
      coverageType: string
      policyNumber: string
      policyNumberPlaceholder: string
      groupNumber: string
      groupNumberPlaceholder: string
      monthlyPremium: string
      monthlyPremiumPlaceholder: string
      disabilitySection: string
      disabilityDescription: string
      hasDisability: string
      disabilityDetails: string
      disabilityDetailsPlaceholder: string
      needsAssistance: string
      assistanceDetails: string
      assistanceDetailsPlaceholder: string
      isIncarcerated: string
      incarcerationDetails: string
      incarcerationDetailsPlaceholder: string
      pregnancySection: string
      pregnancyDescription: string
      isPregnant: string
      whoIsPregnant: string
      selectHouseholdMember: string
      dueDate: string
      dueDatePlaceholder: string
      medicalConditionsTitle: string
      medicalConditionsDescription: string
      hasChronicConditions: string
      additionalDetails: string
      additionalDetailsPlaceholder: string
      medicalBillsTitle: string
      medicalBillsDescription: string
      hasRecentBills: string
      billDetails: string
      billDetailsPlaceholder: string
      billDetailsNote: string
      longTermCareTitle: string
      longTermCareDescription: string
      needsNursingServices: string
      yesNursingServices: string
      noNursingServices: string
      nursingServicesNote: string
    }
  }
}

export interface Translations {
  [key: string]: TranslationData
}

import { en } from "./en"
import { es } from "./es"

interface TranslationContextType {
  language: "en" | "es"
  setLanguage: (lang: "en" | "es") => void
  t: (key: string) => string
  isLoading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const translations: Record<"en" | "es", TranslationData> = {
  en,
  es,
}

const DEFAULT_LANGUAGE: "en" | "es" = "en"

function getTranslationValue(data: TranslationData, key: string): string {
  const keys = key.split(".")
  let current: any = data

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k]
    } else {
      return key // Return key if translation not found
    }
  }

  return typeof current === "string" ? current : key
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<"en" | "es">(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)

    try {
      const savedLanguage = localStorage.getItem("preferred-language") as "en" | "es"
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
        setLanguageState(savedLanguage)
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }

    setIsLoading(false)
  }, [])

  const setLanguage = (lang: "en" | "es") => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("preferred-language", lang)
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    }
  }

  const t = (key: string): string => {
    const currentLang = isHydrated ? language : DEFAULT_LANGUAGE
    return getTranslationValue(translations[currentLang], key)
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

// Utility function to get nested translation value
export function getTranslation(translations: TranslationData, key: string): string {
  const keys = key.split(".")
  let current: any = translations

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k]
    } else {
      return key // Return key if translation not found
    }
  }

  return typeof current === "string" ? current : key
}

// Language metadata
export const LANGUAGES: Record<Language, { name: string; nativeName: string; flag: string }> = {
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  fr: { name: "French", nativeName: "Français", flag: "🇫🇷" },
  zh: { name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  ar: { name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  ru: { name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  pt: { name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  it: { name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  ja: { name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
}

export const DEFAULT_LANGUAGE_CONST: Language = "en"
