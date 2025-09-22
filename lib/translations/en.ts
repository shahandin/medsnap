import type { TranslationData } from "./index"

export const en: TranslationData = {
  // Navigation
  nav: {
    about: "About",
    applyForBenefits: "Apply for Benefits",
    dashboard: "Dashboard",
    signIn: "Sign In",
    getStarted: "Get Started",
    language: "Language",
  },

  // Homepage
  home: {
    trustedBy: "Trusted by thousands nationwide",
    heroTitle: "Access Your Benefits with",
    heroTitleHighlight: "Confidence",
    heroDescription:
      "Streamlined applications for Medicaid and SNAP benefits. Get the support you need with our secure, easy-to-use platform designed for your success.",
    applyForBenefits: "Apply for Benefits",
    learnMore: "Learn More",
    whyChooseTitle: "Why Choose Benefit Bridge?",
    whyChooseDescription:
      "We've designed our platform to make applying for benefits as simple, secure, and stress-free as possible.",

    // Feature cards
    features: {
      comprehensive: {
        title: "Comprehensive Platform",
        description:
          "One platform for everything: submit applications, upload documentation, report life changes, respond to notifications, renew benefits, and more.",
      },
      easyApplication: {
        title: "Easy Application",
        description: "Step-by-step guidance through the entire application process with clear, intuitive instructions.",
      },
      securePrivate: {
        title: "Secure & Private",
        description:
          "Your personal information is protected with bank-level security, encryption, and privacy controls.",
      },
      aiEnabled: {
        title: "AI Enabled",
        description: "AI enabled assistant that guides you through your application and answers all of your questions.",
      },
    },

    // CTA section
    cta: {
      title: "Ready to Get Started?",
      description:
        "Join thousands of people who have successfully applied for benefits through our secure, user-friendly platform. Your journey to accessing benefits starts here.",
      startApplication: "Start Your Application",
    },
  },

  // Authentication
  auth: {
    signIn: {
      title: "Welcome back",
      subtitle: "Sign in to your account",
      email: "Email",
      password: "Password",
      emailPlaceholder: "you@example.com",
      showPassword: "Show password",
      hidePassword: "Hide password",
      signingIn: "Signing in...",
      signInButton: "Sign In",
      noAccount: "Don't have an account?",
      signUpLink: "Sign up",
    },
    signUp: {
      title: "Create your account",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      emailPlaceholder: "you@example.com",
      showPassword: "Show password",
      hidePassword: "Hide password",
      creatingAccount: "Creating account...",
      createAccountButton: "Create Account",
      hasAccount: "Already have an account?",
      signInLink: "Sign in",
      passwordRequirements: {
        minLength: "At least 8 characters long",
        hasNumber: "Contains at least one number",
        hasSpecialChar: 'Contains at least one special character (!@#$%^&*(),.?":{}|<>)',
        passwordsMatch: "Passwords match",
      },
      successMessage: "Account created successfully! Please check your email to confirm your account.",
    },
  },

  // Prescreening
  prescreening: {
    title: "Benefits Eligibility Check",
    subtitle:
      "Answer a few quick questions to see if you might qualify for Medicaid and SNAP benefits. This will help you decide which applications to complete.",
    processingMessage: "Processing your responses...",
    questionProgress: "Question {{current}} of {{total}}",
    complete: "Complete",
    questions: {
      income: {
        text: "Is your household's monthly income less than $2,500?",
        help: "Include all income from jobs, benefits, and other sources for everyone in your household.",
      },
      assets: {
        text: "Do you have less than $2,000 in savings and assets?",
        help: "Include bank accounts, investments, and valuable items (excluding your home and one car).",
      },
      citizenship: {
        text: "Are you a U.S. citizen or qualified non-citizen?",
        help: "Qualified non-citizens include permanent residents and certain other immigration statuses.",
      },
      ageDisability: {
        text: "Are you 65 or older, pregnant, or have a disability?",
        help: "This helps determine eligibility for certain Medicaid programs.",
      },
      householdSize: {
        text: "Do you have 4 or fewer people in your household?",
        help: "Count yourself, your spouse (if married), and any dependents you claim on taxes.",
      },
      workRequirements: {
        text: "Are you working at least 20 hours per week, or do you qualify for an exemption?",
        help: "Exemptions include being under 18, over 50, pregnant, disabled, or caring for young children.",
      },
    },
    results: {
      title: "Your Eligibility Results",
      subtitle: "Based on your responses, here's your potential eligibility for benefits",
      mayQualify: "May Qualify",
      mayNotQualify: "May Not Qualify",
      medicaidEligible:
        "You may qualify for Medicaid health coverage. Complete the full application to verify your eligibility.",
      medicaidNotEligible:
        "Based on your responses, you may not qualify for Medicaid. However, eligibility rules are complex - consider applying anyway.",
      snapEligible:
        "You may qualify for SNAP food assistance. Complete the full application to verify your eligibility.",
      snapNotEligible:
        "Based on your responses, you may not qualify for SNAP. However, eligibility rules are complex - consider applying anyway.",
      importantNote: "Important Note",
      disclaimer:
        "This is a preliminary assessment only. Final eligibility is determined by your state agency after reviewing your complete application and verifying your information. We encourage you to apply even if the prescreening suggests you may not qualify.",
      continueToApplications: "Continue to Applications",
    },
  },

  // Application Choice
  applicationChoice: {
    title: "Your Applications",
    subtitle: "Choose how you'd like to proceed with your benefits application",
    startNew: {
      title: "Start New Application",
      description: "Begin a fresh benefits application from the beginning",
      button: "Start New",
    },
    continueExisting: {
      title: "Continue Existing",
      description: "Resume working on applications you've already started",
      noApplications: "No applications in progress",
      noApplicationsButton: "No Applications to Continue",
      lastSaved: "Last saved:",
      currentStep: "Current step:",
    },
    loading: "Loading your applications...",
    medicaidApplication: "Medicaid Application",
    snapApplication: "SNAP Application",
    bothApplication: "Medicaid & SNAP Application",
    benefitsApplication: "Benefits Application",
  },

  // Dashboard
  dashboard: {
    title: "Account Dashboard",
    welcome: "Welcome back",
    tabs: {
      overview: "Overview",
      applications: "Applications",
      documents: "Documents",
      notifications: "Notifications",
      profile: "Profile",
      settings: "Settings",
    },
    overview: {
      quickActions: "Quick Actions",
      recentActivity: "Recent Activity",
      applicationStatus: "Application Status",
      upcomingDeadlines: "Upcoming Deadlines",
    },
    applications: {
      title: "My Applications",
      status: {
        draft: "Draft",
        submitted: "Submitted",
        underReview: "Under Review",
        approved: "Approved",
        denied: "Denied",
        needsInfo: "Needs Information",
      },
      actions: {
        continue: "Continue",
        view: "View",
        edit: "Edit",
        download: "Download",
      },
    },
    notifications: {
      title: "Notifications",
      markAllRead: "Mark All as Read",
      noNotifications: "No notifications",
      types: {
        application: "Application Update",
        document: "Document Request",
        deadline: "Deadline Reminder",
        system: "System Notification",
      },
    },
    profile: {
      title: "Profile Information",
      personalInfo: "Personal Information",
      contactInfo: "Contact Information",
      emergencyContact: "Emergency Contact",
      saveChanges: "Save Changes",
      changesSaved: "Changes saved successfully",
    },
    settings: {
      title: "Account Settings",
      language: "Language Preference",
      notifications: "Notification Preferences",
      privacy: "Privacy Settings",
      security: "Security Settings",
      signOut: "Sign Out",
    },
  },

  // Forms
  forms: {
    personalInfo: {
      title: "Personal Information",
      subtitle: "Please provide your basic personal information",
      firstName: "First Name",
      lastName: "Last Name",
      middleName: "Middle Name",
      dateOfBirth: "Date of Birth",
      ssn: "Social Security Number",
      phone: "Phone Number",
      email: "Email Address",
      address: "Address",
      city: "City",
      state: "State",
      zipCode: "ZIP Code",
      county: "County",
      required: "Required",
      optional: "Optional",
    },
    household: {
      title: "Household Information",
      subtitle: "Tell us about the people in your household",
      householdSize: "Household Size",
      addMember: "Add Household Member",
      removeMember: "Remove Member",
      relationship: "Relationship",
      relationships: {
        spouse: "Spouse",
        child: "Child",
        parent: "Parent",
        sibling: "Sibling",
        other: "Other",
      },
    },
    income: {
      title: "Income Information",
      subtitle: "Please provide information about all sources of income",
      employmentStatus: "Employment Status",
      employer: "Employer",
      jobTitle: "Job Title",
      monthlyIncome: "Monthly Income",
      hourlyWage: "Hourly Wage",
      hoursPerWeek: "Hours per Week",
      addIncomeSource: "Add Income Source",
      removeIncomeSource: "Remove Income Source",
      incomeTypes: {
        employment: "Employment",
        selfEmployment: "Self-Employment",
        unemployment: "Unemployment Benefits",
        socialSecurity: "Social Security",
        disability: "Disability Benefits",
        pension: "Pension",
        other: "Other",
      },
    },
    assets: {
      title: "Asset Information",
      subtitle:
        "Please provide information about assets owned by you or members of your household. This includes financial accounts, vehicles, and life insurance policies.",
      currentAssets: "Current Assets",
      addNewAsset: "Add New Asset",
      addFinancialAsset: "Add Financial Asset",
      addVehicle: "Add Vehicle",
      addLifeInsurance: "Add Life Insurance",
      assetOwner: "Asset Owner",
      accountType: "Account Type",
      bankName: "Bank/Institution Name",
      currentBalance: "Current Balance",
      vehicleType: "Vehicle Type",
      make: "Make",
      model: "Model",
      year: "Year",
      estimatedValue: "Estimated Current Value",
      policyType: "Policy Type",
      insuranceCompany: "Insurance Company",
      faceValue: "Face Value (Death Benefit)",
      cashValue: "Cash Value",
      noAssetsMessage: "No assets added yet. Click the buttons above to add your first asset.",
      noAssetsNote: "If you don't have any assets to report, you can proceed to the next section.",
      financialAsset: "Financial Asset",
      vehicle: "Vehicle",
      lifeInsurancePolicy: "Life Insurance Policy",
    },
    health: {
      title: "Health & Disability Information",
      subtitle: "Please provide information about health insurance and any disabilities",
      hasInsurance: "Do you have health insurance?",
      insuranceType: "Insurance Type",
      hasDisability: "Do you have a disability?",
      disabilityType: "Disability Type",
      needsAssistance: "Do you need assistance with daily activities?",
    },
    review: {
      title: "Review & Submit",
      subtitle: "Please review your application before submitting",
      sections: {
        personalInfo: "Personal Information",
        household: "Household Information",
        income: "Income Information",
        assets: "Asset Information",
        health: "Health & Disability",
      },
      edit: "Edit",
      submit: "Submit Application",
      submitting: "Submitting...",
      confirmation: "Application submitted successfully!",
    },
  },

  // About Page
  about: {
    hero: {
      title: "About Benefits Access",
      subtitle:
        "We're dedicated to simplifying the benefits application process and helping people access the support they need with dignity and ease.",
    },
    mission: {
      title: "Our Mission",
      subtitle:
        "To create a more accessible, user-friendly experience for applying to essential government benefit programs.",
      bridgingGap: {
        title: "Bridging the Gap",
        description1:
          "Traditional government benefit applications can be complex, time-consuming, and difficult to navigate. We've redesigned the experience from the ground up, focusing on clarity, accessibility, and user empowerment.",
        description2:
          "Our platform guides users through each step of the application process with clear instructions, helpful resources, and automatic progress saving, ensuring no one gets left behind.",
      },
      peopleFirst: {
        title: "People-First Approach",
        description:
          "Every design decision is made with real people and their needs in mind, ensuring dignity and respect throughout the process.",
      },
    },
    services: {
      title: "What We Provide",
      subtitle: "Our platform offers comprehensive support for accessing essential government benefit programs.",
      medicaid: {
        title: "Medicaid Applications",
        description:
          "Streamlined applications for Medicaid health insurance coverage, including eligibility screening and document guidance.",
      },
      snap: {
        title: "SNAP Benefits",
        description:
          "Easy-to-complete applications for SNAP (food assistance) benefits with household management and income verification support.",
      },
      secure: {
        title: "Secure Processing",
        description:
          "Bank-level security and encryption protect your personal information throughout the application process.",
      },
      tracking: {
        title: "Progress Tracking",
        description:
          "Automatic progress saving allows you to complete applications at your own pace without losing information.",
      },
      support: {
        title: "Expert Support",
        description:
          "Access to knowledgeable support staff and comprehensive resources to help you through any challenges.",
      },
      management: {
        title: "Application Management",
        description:
          "Track your application status, upload additional documents, and manage your benefits all in one place.",
      },
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Our streamlined process makes applying for benefits simple and straightforward.",
      step1: {
        title: "Create Account",
        description:
          "Sign up with your email address and create a secure account to get started with your application.",
      },
      step2: {
        title: "Complete Application",
        description:
          "Follow our step-by-step guide to complete your application. Your progress is saved automatically.",
      },
      step3: {
        title: "Track & Manage",
        description:
          "Monitor your application status and upload any additional documents through your account dashboard.",
      },
    },
    cta: {
      title: "Ready to Get Started?",
      subtitle:
        "Take the first step towards accessing the benefits you need. Our platform is here to guide you every step of the way.",
      startApplication: "Start Your Application",
      contactSupport: "Contact Support",
    },
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    continue: "Continue",
    back: "Back",
    next: "Next",
    submit: "Submit",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    remove: "Remove",
    add: "Add",
    yes: "Yes",
    no: "No",
    optional: "Optional",
    required: "Required",
    selectOption: "Select an option",
    pleaseSelect: "Please select",
    tryAgain: "Try Again",
    retry: "Retry",
    previous: "Previous",
    complete: "Complete",
  },

  // AI Chat Widget translations
  aiChat: {
    title: "Benefits Assistant",
    welcomeMessage:
      "Hi! I'm your benefits assistant. I can help you navigate the application, answer questions about required documents, and guide you through the process. What can I help you with?",
    errorMessage: "I'm sorry, I couldn't process that request. Please try again.",
    technicalError: "I'm experiencing some technical difficulties. Please try again in a moment.",
    placeholder: "Ask me anything about benefits...",
    askAbout: "Ask about",
    helpWith: "Help with",
  },

  // Benefits translations
  benefits: {
    medicaid: "Medicaid",
    snap: "SNAP",
  },

  // Application success page translations
  success: {
    title: "Application Submitted Successfully!",
    subtitle: "Your benefits application has been submitted and is now being processed.",
    signInWarning:
      "Your application was submitted successfully, but you may need to sign in again to access your account dashboard.",
    applicationDetails: "Application Details",
    referenceNumber: "Reference Number",
    submissionDate: "Submission Date",
    saveReferenceNote:
      "Please save your reference number for your records. You'll need it to check your application status.",
    whatHappensNext: {
      title: "What Happens Next?",
      subtitle: "Here's what you can expect during the application process",
      step1: {
        title: "Confirmation Email (Within 24 hours)",
        description: "You'll receive a confirmation email with your reference number and next steps.",
      },
      step2: {
        title: "Application Review (7-30 days)",
        description: "Your state agency will review your application and may request additional documentation.",
      },
      step3: {
        title: "Decision Notification",
        description:
          "You'll be notified of the decision by mail and email, along with information about your benefits.",
      },
    },
    importantInfo: {
      title: "Important Information",
      checkEmail: {
        title: "Check Your Email",
        description:
          "Make sure to check your email regularly, including spam folders, for updates about your application.",
      },
      keepContactUpdated: {
        title: "Keep Your Contact Information Updated",
        description: "Notify your state agency immediately if your address, phone number, or email changes.",
      },
      prepareDocuments: {
        title: "Prepare Additional Documents",
        description:
          "You may be asked to provide additional documentation such as pay stubs, bank statements, or medical records.",
      },
    },
    quickActions: {
      title: "Quick Actions",
      subtitle: "Things you can do while waiting for your application to be processed",
      viewStatus: {
        title: "View Application Status",
        description: "Check your account dashboard",
        signInRequired: "Sign in to access dashboard",
      },
      downloadCopy: {
        title: "Download Application Copy",
        comingSoon: "Coming soon",
      },
      uploadDocuments: {
        title: "Upload Documents",
        comingSoon: "Coming soon",
      },
      learnBenefits: {
        title: "Learn About Benefits",
        description: "Get more information",
        signInRequired: "Sign in to access more features",
      },
    },
    needHelp: {
      title: "Need Help?",
      subtitle: "If you have questions about your application or need assistance, here are your options:",
      generalSupport: {
        title: "General Support",
        description: "For questions about the application process",
        button: "Contact Support",
      },
      stateAgency: {
        title: "State Agency",
        description: "For specific questions about your benefits",
        button: "Find State Contact",
      },
    },
    goToDashboard: "Go to Account Dashboard",
    signInToDashboard: "Sign In to Access Dashboard",
  },
}
