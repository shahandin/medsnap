interface ApplicationContext {
  currentStep: number
  stepTitle: string
  stepDescription: string
  stepId: string
  progressPercentage: number
  canProceed: boolean
  currentStepCompletion: number
  validationErrors: string[]
  hasValidationErrors: boolean
  nextRequiredSteps: string[]
  applicationData: any
  userProfile: any
}

interface IntelligentResponse {
  type: "guided_walkthrough" | "document_assistance" | "error_resolution" | "progress_summary" | "step_guidance"
  content: string
  actionItems?: string[]
  navigationSuggestion?: {
    destination: string
    params?: Record<string, string>
    message: string
  }
}

export function generateGuidedWalkthrough(context: ApplicationContext): IntelligentResponse {
  const { currentStep, stepTitle, applicationData, validationErrors } = context

  let content = `Let me guide you through ${stepTitle} step by step:\n\n`
  let actionItems: string[] = []

  switch (currentStep) {
    case 0: // Benefit Selection
      content += "1. Choose which benefits you want to apply for:\n"
      content += "   • SNAP (food assistance) - helps with grocery costs\n"
      content += "   • Medicaid (health coverage) - provides medical insurance\n"
      content += "   • Both - apply for both programs at once (recommended)\n\n"
      content += "2. Consider your needs:\n"
      content += "   • If you need help with food costs, select SNAP\n"
      content += "   • If you need health insurance, select Medicaid\n"
      content += "   • Most people benefit from both programs\n\n"
      actionItems = ["Select your benefit type", "Click Next to continue"]
      break

    case 1: // State Selection
      content += "1. Select your state of residence from the dropdown\n"
      content += "2. This determines:\n"
      content += "   • Specific eligibility requirements\n"
      content += "   • Processing times and procedures\n"
      content += "   • State-specific benefits and programs\n\n"
      content += "3. Make sure to select the state where you currently live\n"
      actionItems = ["Choose your state from the dropdown", "Verify it's your current residence", "Click Next"]
      break

    case 2: // Personal Information
      content += "1. Fill out your basic information:\n"
      content += "   • Full legal name (as it appears on your ID)\n"
      content += "   • Date of birth\n"
      content += "   • Current address\n"
      content += "   • Phone number and email\n\n"
      content += "2. Important tips:\n"
      content += "   • Use your legal name exactly as on your ID\n"
      content += "   • Provide a current address where you receive mail\n"
      content += "   • Double-check your contact information\n\n"

      if (validationErrors.length > 0) {
        content += "3. Please complete these required fields:\n"
        validationErrors.forEach((error) => {
          content += `   • ${error}\n`
        })
      }

      actionItems = [
        "Enter your full legal name",
        "Add your current address",
        "Provide contact information",
        "Review for accuracy",
      ]
      break

    case 3: // Household Members
      content += "1. Add all people who live with you:\n"
      content += "   • Spouse or partner\n"
      content += "   • Children (including stepchildren)\n"
      content += "   • Parents or other relatives\n"
      content += "   • Anyone who shares meals or expenses\n\n"
      content += "2. For each person, provide:\n"
      content += "   • Full name and relationship to you\n"
      content += "   • Date of birth\n"
      content += "   • Social Security Number (if available)\n\n"
      content += "3. Don't include:\n"
      content += "   • Temporary visitors\n"
      content += "   • People who don't share meals or expenses\n"

      actionItems = [
        "Click 'Add Household Member'",
        "Enter each person's information",
        "Specify relationship to you",
        "Save each member",
      ]
      break

    case 4: // Household Questions
      content += "1. Answer questions about your household's benefit history:\n"
      content += "   • Previous applications with different information\n"
      content += "   • Applications in other states\n"
      content += "   • Past benefit receipt\n\n"

      if (applicationData.benefitType === "snap" || applicationData.benefitType === "both") {
        content += "2. SNAP-specific questions:\n"
        content += "   • Current SNAP benefits\n"
        content += "   • Previous disqualifications\n"
        content += "   • Authorized representatives\n\n"
      }

      content += "3. Be honest and accurate - this helps determine eligibility\n"

      actionItems = [
        "Read each question carefully",
        "Select household members if applicable",
        "Answer all required questions",
        "Review your responses",
      ]
      break

    case 5: // Income & Employment
      content += "1. Report all household income sources:\n"
      content += "   • Employment wages\n"
      content += "   • Self-employment income\n"
      content += "   • Social Security, disability, unemployment\n"
      content += "   • Child support, alimony\n\n"
      content += "2. Add employment information:\n"
      content += "   • Current jobs for all household members\n"
      content += "   • Employer details and income amounts\n\n"
      content += "3. Include expenses:\n"
      content += "   • Housing costs (rent/mortgage)\n"
      content += "   • Utilities\n"
      content += "   • Childcare, medical expenses\n"

      actionItems = [
        "Add all income sources",
        "Include employment details",
        "Report housing expenses",
        "Add other deductible expenses",
      ]
      break

    case 6: // Assets
      content += "1. Report financial assets:\n"
      content += "   • Bank accounts (checking, savings)\n"
      content += "   • Investments, stocks, bonds\n"
      content += "   • Retirement accounts\n\n"
      content += "2. Include vehicles:\n"
      content += "   • Cars, trucks, motorcycles\n"
      content += "   • Current market value\n\n"
      content += "3. Other assets:\n"
      content += "   • Life insurance policies\n"
      content += "   • Property or real estate\n"

      actionItems = [
        "List all bank accounts",
        "Add vehicle information",
        "Include other valuable assets",
        "Provide current values",
      ]
      break

    case 7: // Health & Disability
      content += "1. Health insurance information:\n"
      content += "   • Current coverage for all household members\n"
      content += "   • Employer-provided insurance\n"
      content += "   • Medicare, Medicaid, private insurance\n\n"
      content += "2. Disability and health conditions:\n"
      content += "   • Disabilities affecting work ability\n"
      content += "   • Chronic medical conditions\n"
      content += "   • Pregnancy information\n\n"

      if (applicationData.benefitType === "medicaid" || applicationData.benefitType === "both") {
        content += "3. Medicaid-specific questions:\n"
        content += "   • Need for nursing home services\n"
        content += "   • Long-term care requirements\n\n"
      }

      actionItems = [
        "Add health insurance details",
        "Report any disabilities",
        "Include medical conditions",
        "Answer Medicaid questions if applicable",
      ]
      break

    case 8: // Review & Submit
      content += "1. Review all your information:\n"
      content += "   • Personal details\n"
      content += "   • Household members\n"
      content += "   • Income and expenses\n"
      content += "   • Assets and health information\n\n"
      content += "2. Make any necessary corrections:\n"
      content += "   • Click 'Edit' next to any section\n"
      content += "   • Update information as needed\n\n"
      content += "3. Submit your application:\n"
      content += "   • Certify that information is accurate\n"
      content += "   • Submit for processing\n"

      actionItems = [
        "Review each section carefully",
        "Make corrections if needed",
        "Certify information accuracy",
        "Submit your application",
      ]
      break

    default:
      content += "Continue with the current step and follow the on-screen instructions."
      actionItems = ["Complete the current step", "Click Next to continue"]
  }

  return {
    type: "guided_walkthrough",
    content,
    actionItems,
  }
}

export function generateDocumentAssistance(context: ApplicationContext): IntelligentResponse {
  const { currentStep, stepTitle, applicationData } = context

  let content = `Here are the documents you may need for ${stepTitle}:\n\n`
  let actionItems: string[] = []

  switch (currentStep) {
    case 2: // Personal Information
      content += "**Required Documents:**\n"
      content += "• Photo ID (driver's license, state ID, passport)\n"
      content += "• Social Security card or document with SSN\n"
      content += "• Proof of address (utility bill, lease, mail from last 30 days)\n\n"
      content += "**Tips for gathering documents:**\n"
      content += "• Use clear, readable copies or photos\n"
      content += "• Make sure all text is visible\n"
      content += "• Documents should be current (within 30 days for address proof)\n"

      actionItems = [
        "Gather photo identification",
        "Find Social Security documentation",
        "Collect proof of current address",
        "Ensure documents are clear and readable",
      ]
      break

    case 5: // Income & Employment
      content += "**Income Documentation:**\n"
      content += "• Recent pay stubs (last 4 weeks)\n"
      content += "• Tax returns (most recent year)\n"
      content += "• Bank statements (last 3 months)\n"
      content += "• Social Security award letters\n"
      content += "• Unemployment benefit statements\n"
      content += "• Child support documentation\n\n"
      content += "**Self-Employment:**\n"
      content += "• Business records and receipts\n"
      content += "• Profit and loss statements\n"
      content += "• Tax forms (1099s, Schedule C)\n\n"
      content += "**Housing Expenses:**\n"
      content += "• Rent receipts or lease agreement\n"
      content += "• Mortgage statements\n"
      content += "• Utility bills (electric, gas, water)\n"

      actionItems = [
        "Collect recent pay stubs",
        "Gather tax documents",
        "Find benefit award letters",
        "Get housing expense receipts",
      ]
      break

    case 6: // Assets
      content += "**Financial Assets:**\n"
      content += "• Bank statements (all accounts, last 3 months)\n"
      content += "• Investment account statements\n"
      content += "• Retirement account statements (401k, IRA)\n"
      content += "• Life insurance policies\n\n"
      content += "**Vehicle Information:**\n"
      content += "• Vehicle registration\n"
      content += "• Title or loan documents\n"
      content += "• Current market value estimates\n\n"
      content += "**Property:**\n"
      content += "• Property deeds\n"
      content += "• Property tax assessments\n"

      actionItems = [
        "Gather all bank statements",
        "Find investment documents",
        "Collect vehicle registration",
        "Get property documentation",
      ]
      break

    case 7: // Health & Disability
      content += "**Health Insurance:**\n"
      content += "• Insurance cards (all household members)\n"
      content += "• Policy documents or summaries\n"
      content += "• Medicare cards if applicable\n\n"
      content += "**Medical Documentation:**\n"
      content += "• Disability determination letters\n"
      content += "• Medical records for chronic conditions\n"
      content += "• Doctor's statements about work limitations\n"
      content += "• Pregnancy verification (if applicable)\n\n"
      content += "**Long-term Care:**\n"
      content += "• Nursing home cost estimates\n"
      content += "• Care needs assessments\n"

      actionItems = [
        "Collect insurance cards",
        "Gather medical records",
        "Find disability documentation",
        "Get care needs assessments",
      ]
      break

    default:
      content += "**General Documents Always Helpful:**\n"
      content += "• Photo identification\n"
      content += "• Social Security cards for all household members\n"
      content += "• Proof of income (pay stubs, benefit letters)\n"
      content += "• Bank statements\n"
      content += "• Proof of address\n"

      actionItems = [
        "Gather identification documents",
        "Collect income verification",
        "Find proof of address",
        "Organize by household member",
      ]
  }

  content += "\n**Document Upload Tips:**\n"
  content += "• Take clear photos in good lighting\n"
  content += "• Make sure all text is readable\n"
  content += "• Include all pages of multi-page documents\n"
  content += "• Save documents in a secure location\n"

  return {
    type: "document_assistance",
    content,
    actionItems,
  }
}

export function generateErrorResolution(context: ApplicationContext): IntelligentResponse {
  const { validationErrors, currentStep, stepTitle } = context

  if (validationErrors.length === 0) {
    return {
      type: "error_resolution",
      content: `Great! You've completed all required fields for ${stepTitle}. You can proceed to the next step.`,
      actionItems: ["Click Next to continue"],
    }
  }

  let content = `I can help you fix the issues preventing you from moving forward:\n\n`
  let actionItems: string[] = []

  content += "**Required Fields to Complete:**\n"
  validationErrors.forEach((error, index) => {
    content += `${index + 1}. ${error}\n`

    // Add specific guidance for common errors
    if (error.includes("First name")) {
      content += "   → Enter your legal first name as it appears on your ID\n"
      actionItems.push("Enter your legal first name")
    } else if (error.includes("Last name")) {
      content += "   → Enter your legal last name as it appears on your ID\n"
      actionItems.push("Enter your legal last name")
    } else if (error.includes("Date of birth")) {
      content += "   → Use the date picker or MM/DD/YYYY format\n"
      actionItems.push("Select your date of birth")
    } else if (error.includes("Email")) {
      content += "   → Enter a valid email address (example@email.com)\n"
      actionItems.push("Enter a valid email address")
    } else if (error.includes("Phone")) {
      content += "   → Enter a 10-digit phone number\n"
      actionItems.push("Enter your phone number")
    } else if (error.includes("Address")) {
      content += "   → Enter your complete street address\n"
      actionItems.push("Enter your street address")
    } else if (error.includes("ZIP")) {
      content += "   → Enter a valid 5-digit ZIP code\n"
      actionItems.push("Enter your ZIP code")
    } else if (error.includes("Social Security")) {
      content += "   → Enter your 9-digit Social Security Number\n"
      actionItems.push("Enter your Social Security Number")
    } else if (error.includes("Citizenship")) {
      content += "   → Select your citizenship status from the dropdown\n"
      actionItems.push("Select citizenship status")
    } else if (error.includes("Language")) {
      content += "   → Choose your preferred language\n"
      actionItems.push("Select language preference")
    } else if (error.includes("question")) {
      content += "   → Select Yes or No for this question\n"
      actionItems.push("Answer the required question")
    }
  })

  content += "\n**How to Fix:**\n"
  content += "1. Scroll up to find the highlighted fields\n"
  content += "2. Fill in the missing information\n"
  content += "3. Make sure all required fields are complete\n"
  content += "4. Try clicking Next again\n"

  if (actionItems.length === 0) {
    actionItems = ["Complete all required fields", "Review your entries", "Click Next to continue"]
  }

  return {
    type: "error_resolution",
    content,
    actionItems,
  }
}

export function generateProgressSummary(context: ApplicationContext): IntelligentResponse {
  const { currentStep, progressPercentage, nextRequiredSteps, applicationData, userProfile } = context

  let content = `Hi ${userProfile.name || "there"}! Here's your application progress:\n\n`

  content += `**Overall Progress: ${Math.round(progressPercentage)}% Complete**\n\n`

  // Completed sections
  content += "**✅ Completed Sections:**\n"
  const completedSteps = [
    "Benefit Selection",
    "State Selection",
    "Personal Information",
    "Household Members",
    "Household Questions",
    "Income & Employment",
    "Assets",
    "Health & Disability",
  ].slice(0, currentStep)

  if (completedSteps.length > 0) {
    completedSteps.forEach((step) => {
      content += `• ${step}\n`
    })
  } else {
    content += "• None yet - let's get started!\n"
  }

  // Current section
  content += `\n**📍 Current Section:**\n`
  content += `• ${context.stepTitle} (${context.currentStepCompletion}% complete)\n`

  // Next steps
  if (nextRequiredSteps.length > 0) {
    content += `\n**📋 Coming Up Next:**\n`
    nextRequiredSteps.slice(0, 3).forEach((step) => {
      content += `• ${step}\n`
    })
  }

  // Application summary
  content += `\n**📊 Your Application Summary:**\n`
  content += `• Benefits: ${applicationData.benefitType || "Not selected"}\n`
  content += `• State: ${applicationData.state || "Not selected"}\n`
  content += `• Household Size: ${applicationData.householdSize || 1} ${applicationData.householdSize === 1 ? "person" : "people"}\n`

  if (applicationData.hasEmployment) {
    content += `• Employment: Yes\n`
  }
  if (applicationData.hasOtherIncome) {
    content += `• Other Income: Yes\n`
  }
  if (applicationData.hasAssets) {
    content += `• Assets: ${applicationData.assetCount} reported\n`
  }

  // Encouragement and next steps
  content += `\n**🎯 What's Next:**\n`
  if (context.hasValidationErrors) {
    content += `• Complete the required fields in ${context.stepTitle}\n`
    content += `• Fix any validation errors\n`
  } else if (context.canProceed) {
    content += `• You're ready to move to the next step!\n`
    content += `• Click Next to continue\n`
  } else {
    content += `• Complete the current section: ${context.stepTitle}\n`
    content += `• Fill in all required information\n`
  }

  const actionItems = context.hasValidationErrors
    ? ["Fix validation errors", "Complete required fields", "Continue to next step"]
    : context.canProceed
      ? ["Click Next to continue", "Keep up the great progress!"]
      : ["Complete current section", "Fill required information", "Move to next step"]

  return {
    type: "progress_summary",
    content,
    actionItems,
  }
}

export function generateStepGuidance(context: ApplicationContext): IntelligentResponse {
  const { currentStep, stepTitle, stepDescription, applicationData } = context

  let content = `**${stepTitle}**\n\n`
  content += `${stepDescription}\n\n`

  // Add step-specific guidance
  switch (currentStep) {
    case 0:
      content += "**Why This Matters:**\n"
      content +=
        "Selecting the right benefits ensures you get all the help you're eligible for. Most people qualify for both SNAP and Medicaid.\n\n"
      content += "**Quick Guide:**\n"
      content += "• SNAP helps with food costs (average $200+ per month)\n"
      content += "• Medicaid provides health insurance coverage\n"
      content += "• Applying for both gives you maximum support\n"
      break

    case 1:
      content += "**Why This Matters:**\n"
      content +=
        "Each state has different eligibility rules and processing procedures. Selecting the correct state ensures your application is processed properly.\n\n"
      content += "**Important:**\n"
      content += "• Choose where you currently live, not where you work\n"
      content += "• If you recently moved, use your current address state\n"
      break

    case 2:
      content += "**Why This Matters:**\n"
      content +=
        "Accurate personal information ensures your benefits are processed correctly and you receive important communications.\n\n"
      content += "**Pro Tips:**\n"
      content += "• Use your legal name exactly as on your ID\n"
      content += "• Provide an address where you reliably receive mail\n"
      content += "• Double-check your contact information\n"
      break

    case 3:
      content += "**Why This Matters:**\n"
      content +=
        "Household size affects your benefit amount and eligibility. Include everyone who lives with you and shares meals or expenses.\n\n"
      content += "**Include:**\n"
      content += "• Spouse, children, parents living with you\n"
      content += "• Anyone who shares meals or living expenses\n\n"
      content += "**Don't Include:**\n"
      content += "• Temporary visitors or boarders\n"
      break

    case 4:
      content += "**Why This Matters:**\n"
      content +=
        "These questions help determine eligibility and prevent duplicate benefits. Answer honestly - previous applications won't disqualify you.\n\n"
      content += "**Be Honest:**\n"
      content += "• Previous applications are normal and expected\n"
      content += "• This information helps process your application faster\n"
      break

    case 5:
      content += "**Why This Matters:**\n"
      content +=
        "Income information determines your benefit amount. Report all income sources, but also include expenses that can increase your benefits.\n\n"
      content += "**Include All Income:**\n"
      content += "• Jobs, self-employment, benefits, support payments\n\n"
      content += "**Don't Forget Expenses:**\n"
      content += "• Housing costs, childcare, medical expenses can increase benefits\n"
      break

    case 6:
      content += "**Why This Matters:**\n"
      content += "Asset limits vary by program. Most households qualify regardless of assets, especially for SNAP.\n\n"
      content += "**Good News:**\n"
      content += "• SNAP has no asset limit for most households\n"
      content += "• Your home and one vehicle usually don't count\n"
      break

    case 7:
      content += "**Why This Matters:**\n"
      content +=
        "Health information helps determine Medicaid eligibility and any special accommodations you may need.\n\n"
      content += "**Include:**\n"
      content += "• All current health insurance\n"
      content += "• Any disabilities or chronic conditions\n"
      content += "• Pregnancy information if applicable\n"
      break

    case 8:
      content += "**Final Step:**\n"
      content += "Review everything carefully before submitting. You can edit any section if needed.\n\n"
      content += "**After Submission:**\n"
      content += "• You'll receive a confirmation\n"
      content += "• Processing typically takes 30-45 days\n"
      content += "• You may be contacted for additional information\n"
      break
  }

  return {
    type: "step_guidance",
    content,
    actionItems: ["Read the guidance above", "Complete this step", "Ask if you need help"],
  }
}

export function generateIntelligentResponse(query: string, context: ApplicationContext): IntelligentResponse | null {
  const lowerQuery = query.toLowerCase()

  // Detect what type of help the user needs
  if (
    lowerQuery.includes("walkthrough") ||
    lowerQuery.includes("step by step") ||
    lowerQuery.includes("guide me through")
  ) {
    return generateGuidedWalkthrough(context)
  }

  if (lowerQuery.includes("document") || lowerQuery.includes("paperwork") || lowerQuery.includes("what do i need")) {
    return generateDocumentAssistance(context)
  }

  if (
    lowerQuery.includes("error") ||
    lowerQuery.includes("required") ||
    lowerQuery.includes("missing") ||
    lowerQuery.includes("can't proceed") ||
    lowerQuery.includes("stuck") ||
    context.hasValidationErrors
  ) {
    return generateErrorResolution(context)
  }

  if (
    lowerQuery.includes("progress") ||
    lowerQuery.includes("summary") ||
    lowerQuery.includes("how far") ||
    lowerQuery.includes("what's left") ||
    lowerQuery.includes("status")
  ) {
    return generateProgressSummary(context)
  }

  if (lowerQuery.includes("help with") || lowerQuery.includes("what is") || lowerQuery.includes("explain")) {
    return generateStepGuidance(context)
  }

  return null
}
