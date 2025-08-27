// Comprehensive knowledge base for the AI chat assistant
export const BENEFITS_KNOWLEDGE_BASE = {
  // Platform navigation and structure
  platform: {
    pages: {
      homepage: {
        path: "/",
        description: "General information, getting started, and platform overview",
        features: ["Hero section", "Benefits overview", "Getting started guide", "Success stories"],
      },
      about: {
        path: "/about",
        description: "Platform services, mission, and detailed information about benefits",
        features: ["Service overview", "Eligibility information", "Process explanation", "Support resources"],
      },
      application: {
        path: "/application",
        description: "9-step benefits application process",
        features: ["Step-by-step form", "Progress tracking", "Auto-save", "Document guidance"],
      },
      account: {
        path: "/account",
        description: "User dashboard with applications, notifications, and profile management",
        features: ["Application history", "Notifications", "Document uploads", "Profile settings", "Report changes"],
      },
    },
  },

  // Application process details
  applicationSteps: {
    1: {
      title: "Benefit Selection",
      description: "Choose which benefits to apply for",
      options: ["Medicaid only", "SNAP only", "Both Medicaid and SNAP"],
      guidance:
        "Choose based on your needs. Medicaid provides health coverage, SNAP provides food assistance. You can apply for both if eligible.",
      commonQuestions: [
        "What's the difference between Medicaid and SNAP?",
        "Can I apply for both programs?",
        "What if I'm not sure which benefits I need?",
      ],
    },
    2: {
      title: "State Selection",
      description: "Select your state of residence",
      guidance:
        "Choose the state where you currently live. Benefits are administered at the state level, so this determines your eligibility requirements.",
      requirements: "You must be a resident of the state you select",
    },
    3: {
      title: "Personal Information",
      description: "Basic personal details and contact information",
      requiredFields: [
        "Full legal name",
        "Date of birth",
        "Social Security Number",
        "Current address",
        "Phone number",
        "Email address",
        "Citizenship status",
        "Language preference",
      ],
      requiredDocuments: [
        "Photo ID (driver's license, state ID, passport)",
        "Social Security card or W-2",
        "Proof of address (utility bill, lease agreement, mail from government agency)",
      ],
      tips: [
        "Use your legal name exactly as it appears on official documents",
        "Provide a reliable phone number where you can be reached",
        "Make sure your address is current and where you receive mail",
      ],
    },
    4: {
      title: "Household Members",
      description: "Add family members who live with you",
      guidance:
        "Include everyone who lives in your home and shares meals or expenses, including children, spouse, parents, and other relatives.",
      requiredInfo: [
        "Full name and relationship to you",
        "Date of birth",
        "Social Security Number (if available)",
        "Citizenship status",
      ],
      requiredDocuments: [
        "Birth certificates for all household members",
        "Social Security cards for all members",
        "Immigration documents (if applicable)",
      ],
    },
    5: {
      title: "Household Questions",
      description: "Questions about household benefit history",
      topics: [
        "Previous benefit applications",
        "Applications in other states",
        "Current SNAP benefits",
        "Benefit disqualifications",
        "Authorized representatives",
      ],
      guidance:
        "Answer honestly about any previous benefit history. This helps determine eligibility and prevents duplicate benefits.",
    },
    6: {
      title: "Income & Expenses",
      description: "Employment, income sources, and household expenses",
      incomeTypes: [
        "Employment wages",
        "Self-employment income",
        "Social Security benefits",
        "Unemployment benefits",
        "Child support",
        "Rental income",
        "Investment income",
      ],
      expenseTypes: [
        "Rent or mortgage payments",
        "Utilities (electric, gas, water, phone)",
        "Child care costs",
        "Medical expenses",
        "Court-ordered support payments",
      ],
      requiredDocuments: [
        "Pay stubs (last 4 weeks)",
        "Tax returns (most recent)",
        "Bank statements (last 3 months)",
        "Unemployment benefit statements",
        "Social Security award letters",
        "Rent receipts or mortgage statements",
        "Utility bills",
        "Child care receipts",
      ],
      tips: [
        "Include all sources of income, even irregular amounts",
        "Keep receipts for all expenses you report",
        "Report gross income (before taxes and deductions)",
      ],
    },
    7: {
      title: "Assets",
      description: "Financial assets, property, and vehicles",
      assetTypes: [
        "Bank accounts (checking, savings)",
        "Investment accounts",
        "Retirement accounts",
        "Vehicles",
        "Real estate",
        "Life insurance policies",
        "Personal property of significant value",
      ],
      limits: {
        general: "$2,000 for most households",
        elderly: "$3,000 for households with elderly or disabled members",
      },
      requiredDocuments: [
        "Bank statements (last 3 months)",
        "Investment account statements",
        "Vehicle titles and registration",
        "Property deeds",
        "Life insurance policies",
      ],
      exemptions: [
        "Primary residence",
        "One vehicle per household member",
        "Household goods and personal belongings",
        "Retirement accounts (in some cases)",
      ],
    },
    8: {
      title: "Health & Disability",
      description: "Health insurance and disability information",
      topics: [
        "Current health insurance coverage",
        "Disability status",
        "Pregnancy information",
        "Chronic medical conditions",
        "Long-term care needs",
        "Recent medical expenses",
      ],
      requiredDocuments: [
        "Health insurance cards",
        "Medical records for disabilities",
        "Doctor's statements",
        "Medical bills and receipts",
        "Prescription receipts",
      ],
    },
    9: {
      title: "Review & Submit",
      description: "Final review and application submission",
      guidance: "Carefully review all information before submitting. You can edit any section by clicking on it.",
      afterSubmission: [
        "You'll receive a confirmation number",
        "Keep this number for your records",
        "You may be contacted for additional information",
        "Processing typically takes 30-45 days",
      ],
    },
  },

  // Eligibility information
  eligibility: {
    medicaid: {
      description: "Health insurance program for low-income individuals and families",
      basicRequirements: [
        "Meet income requirements for your state and household size",
        "Be a U.S. citizen or qualified immigrant",
        "Reside in the state where you're applying",
      ],
      incomeGuidelines: "Generally 138% of Federal Poverty Level, but varies by state",
      specialCategories: ["Pregnant women", "Children under 19", "Adults with disabilities", "Adults 65 and older"],
    },
    snap: {
      description: "Food assistance program (formerly known as food stamps)",
      basicRequirements: [
        "Meet income and asset limits",
        "Be a U.S. citizen or qualified immigrant",
        "Meet work requirements (if applicable)",
      ],
      incomeGuidelines: "Generally 130% of Federal Poverty Level",
      assetLimits: "$2,000 for most households, $3,000 for elderly/disabled",
      workRequirements:
        "Able-bodied adults 18-49 without dependents must work or participate in training 20+ hours per week",
    },
  },

  // Document guidance
  documents: {
    whereToFind: {
      "Social Security card": "Social Security Administration office, online at ssa.gov, or call 1-800-772-1213",
      "Birth certificate": "Vital records office in the state where you were born",
      "Pay stubs": "Your employer's payroll department or HR office",
      "Tax returns": "IRS website (irs.gov), your tax preparer, or IRS office",
      "Bank statements": "Your bank's website, mobile app, or visit a branch",
      "Utility bills": "Your utility company's website or customer service",
      "Rent receipts": "Your landlord or property management company",
      "Medical records": "Your doctor's office or hospital records department",
    },
    alternatives: {
      "No Social Security card": "W-2 form, tax return, or Social Security statement",
      "No birth certificate": "Passport, hospital birth record, or religious record",
      "No pay stubs": "Letter from employer, tax return, or bank deposit records",
      "No bank statements": "Passbook, check register, or letter from bank",
    },
  },

  // Common issues and solutions
  troubleshooting: {
    "Application won't save": [
      "Check your internet connection",
      "Try refreshing the page",
      "Make sure all required fields are filled out",
      "Contact support if the problem persists",
    ],
    "Missing documents": [
      "Check the document alternatives list",
      "Contact the issuing agency for replacements",
      "Ask about temporary verification options",
      "Submit what you have and explain what's missing",
    ],
    "Income calculation questions": [
      "Include all sources of income",
      "Use gross income (before taxes)",
      "Average irregular income over the past 12 months",
      "Include income from all household members",
    ],
    "Household composition questions": [
      "Include everyone who lives with you and shares meals",
      "Include children even if they don't live with you full-time",
      "Don't include temporary visitors",
      "Include elderly parents or relatives you support",
    ],
  },

  // After application submission
  postSubmission: {
    nextSteps: [
      "Keep your confirmation number safe",
      "Watch for mail or calls from the benefits office",
      "Respond quickly to any requests for additional information",
      "Continue to report any changes in your situation",
    ],
    timeline: {
      "Initial processing": "7-10 business days",
      "Interview scheduling": "Within 30 days of application",
      "Final decision": "30-45 days from application date",
      "Emergency SNAP": "Within 7 days if you qualify",
    },
    reportingChanges: [
      "Changes in income (within 10 days)",
      "Changes in household composition",
      "Changes in address or contact information",
      "Changes in employment status",
      "Changes in other benefits received",
    ],
  },

  // Enhanced reporting changes section for existing benefit recipients
  reportingChanges: {
    description: "For users who already have Medicaid/SNAP and need to report life changes",
    accessPath: "Dashboard → Report Changes tab",
    categories: {
      householdChanges: {
        title: "Changes in household size",
        examples: [
          "New baby born",
          "Someone moved in or out",
          "Marriage or divorce",
          "Death in family",
          "Child custody changes",
        ],
        requiredInfo: [
          "Name and relationship of person",
          "Date of change",
          "New household composition",
          "Supporting documents (birth certificate, marriage certificate, etc.)",
        ],
        timeframe: "Report within 10 days of change",
      },
      incomeChanges: {
        title: "Changes in income and assets",
        examples: [
          "Job loss or new employment",
          "Change in work hours or pay rate",
          "New sources of income",
          "Changes in benefits from other programs",
          "Significant changes in assets",
        ],
        requiredInfo: [
          "Type of income change",
          "New income amount",
          "Date change took effect",
          "Supporting documents (pay stubs, termination letter, etc.)",
        ],
        timeframe: "Report within 10 days of change",
      },
      addressChanges: {
        title: "Changes in residency",
        examples: [
          "Moving to new address",
          "Temporary relocation",
          "Moving to different state",
          "Change in living situation",
        ],
        requiredInfo: [
          "New address",
          "Date of move",
          "Reason for move",
          "Proof of new address (utility bill, lease, etc.)",
        ],
        timeframe: "Report within 10 days of change",
      },
      insuranceChanges: {
        title: "Changes in health insurance coverage",
        examples: [
          "Got new job with health insurance",
          "Lost employer health coverage",
          "Became eligible for Medicare",
          "Changes in other health coverage",
        ],
        requiredInfo: [
          "Type of insurance change",
          "Insurance company and policy details",
          "Effective date of change",
          "Insurance cards or documentation",
        ],
        timeframe: "Report within 10 days of change",
      },
    },
    consequences: {
      reporting: "Reporting changes helps ensure you receive the correct benefit amount and maintain eligibility",
      notReporting: "Failure to report changes may result in overpayments that must be repaid, or loss of benefits",
    },
  },
}

// Helper functions for the AI to use
export const getStepGuidance = (stepNumber: number) => {
  return BENEFITS_KNOWLEDGE_BASE.applicationSteps[stepNumber as keyof typeof BENEFITS_KNOWLEDGE_BASE.applicationSteps]
}

export const getDocumentInfo = (documentType: string) => {
  const whereToFind = BENEFITS_KNOWLEDGE_BASE.documents.whereToFind
  const alternatives = BENEFITS_KNOWLEDGE_BASE.documents.alternatives

  return {
    whereToFind: whereToFind[documentType as keyof typeof whereToFind],
    alternatives: alternatives[documentType as keyof typeof alternatives],
  }
}

export const getEligibilityInfo = (program: "medicaid" | "snap") => {
  return BENEFITS_KNOWLEDGE_BASE.eligibility[program]
}

export const getReportingChangesInfo = () => {
  return BENEFITS_KNOWLEDGE_BASE.reportingChanges
}
