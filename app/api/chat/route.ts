import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { getStepGuidance } from "@/lib/chat-knowledge-base"
import { createClient } from "@/lib/supabase/server"
import { saveChatMessage, getChatHistory } from "@/lib/chat-memory"

const US_STATES = [
  { name: "Alabama", code: "AL" },
  { name: "Alaska", code: "AK" },
  { name: "Arizona", code: "AZ" },
  { name: "Arkansas", code: "AR" },
  { name: "California", code: "CA" },
  { name: "Colorado", code: "CO" },
  { name: "Connecticut", code: "CT" },
  { name: "Delaware", code: "DE" },
  { name: "Florida", code: "FL" },
  { name: "Georgia", code: "GA" },
  { name: "Hawaii", code: "HI" },
  { name: "Idaho", code: "ID" },
  { name: "Illinois", code: "IL" },
  { name: "Indiana", code: "IN" },
  { name: "Iowa", code: "IA" },
  { name: "Kansas", code: "KS" },
  { name: "Kentucky", code: "KY" },
  { name: "Louisiana", code: "LA" },
  { name: "Maine", code: "ME" },
  { name: "Maryland", code: "MD" },
  { name: "Massachusetts", code: "MA" },
  { name: "Michigan", code: "MI" },
  { name: "Minnesota", code: "MN" },
  { name: "Mississippi", code: "MS" },
  { name: "Missouri", code: "MO" },
  { name: "Montana", code: "MT" },
  { name: "Nebraska", code: "NE" },
  { name: "Nevada", code: "NV" },
  { name: "New Hampshire", code: "NH" },
  { name: "New Jersey", code: "NJ" },
  { name: "New Mexico", code: "NM" },
  { name: "New York", code: "NY" },
  { name: "North Carolina", code: "NC" },
  { name: "North Dakota", code: "ND" },
  { name: "Ohio", code: "OH" },
  { name: "Oklahoma", code: "OK" },
  { name: "Oregon", code: "OR" },
  { name: "Pennsylvania", code: "PA" },
  { name: "Rhode Island", code: "RI" },
  { name: "South Carolina", code: "SC" },
  { name: "South Dakota", code: "SD" },
  { name: "Tennessee", code: "TN" },
  { name: "Texas", code: "TX" },
  { name: "Utah", code: "UT" },
  { name: "Vermont", code: "VT" },
  { name: "Virginia", code: "VA" },
  { name: "Washington", code: "WA" },
  { name: "West Virginia", code: "WV" },
  { name: "Wisconsin", code: "WI" },
  { name: "Wyoming", code: "WY" },
  { name: "District of Columbia", code: "DC" },
]

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { message, context, conversationHistory, sessionId } = requestData

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let enhancedConversationHistory = conversationHistory || []

    if (user && sessionId) {
      try {
        const dbHistory = await getChatHistory(user.id, sessionId, 10)
        enhancedConversationHistory = dbHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      } catch (error) {
        console.error("[v0] Chat API: Error loading conversation history:", error)
      }
    }

    const isSimpleNavigationRequest =
      /\b(navigate me|take me|go to|show me|bring me|direct me)\s+(to\s+)?(the\s+)?(application|dashboard|home|about|profile|documents|notifications)/i.test(
        message,
      ) ||
      /^(application|dashboard|home|about|profile|documents|notifications)$/i.test(message.trim()) ||
      /\b(start|begin|open)\s+(the\s+)?application/i.test(message)

    if (isSimpleNavigationRequest) {
      console.log("[v0] Chat API: Detected simple navigation request")

      let navigationAction = null
      let responseMessage = ""

      if (/application/i.test(message)) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          message: "Taking you to the application form now...",
        }
        responseMessage = "Taking you to the application form now..."
      } else if (/dashboard/i.test(message)) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          message: "Taking you to your dashboard now...",
        }
        responseMessage = "Taking you to your dashboard now..."
      } else if (/home/i.test(message)) {
        navigationAction = {
          type: "navigate",
          destination: "/",
          message: "Taking you to the homepage now...",
        }
        responseMessage = "Taking you to the homepage now..."
      } else if (/about/i.test(message)) {
        navigationAction = {
          type: "navigate",
          destination: "/about",
          message: "Taking you to the about page now...",
        }
        responseMessage = "Taking you to the about page now..."
      } else if (/profile/i.test(message)) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "profile" },
          message: "Taking you to your profile now...",
        }
        responseMessage = "Taking you to your profile now..."
      } else if (/documents/i.test(message)) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "documents" },
          message: "Taking you to your documents now...",
        }
        responseMessage = "Taking you to your documents now..."
      } else if (/notifications/i.test(message)) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "notifications" },
          message: "Taking you to your notifications now...",
        }
        responseMessage = "Taking you to your notifications now..."
      }

      if (user && sessionId) {
        try {
          await saveChatMessage(user.id, sessionId, "user", message, context)
          await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, navigationAction)
        } catch (error) {
          console.error("[v0] Chat API: Error saving navigation exchange:", error)
        }
      }

      return NextResponse.json({
        message: responseMessage,
        action: navigationAction,
      })
    }

    const isDashboardInteraction =
      /\b(report|change|income|household|address|insurance|overview|applications|notifications|profile)\b/i.test(
        message,
      ) &&
      (context?.currentPath?.includes("/account") || /dashboard/i.test(message))

    if (isDashboardInteraction) {
      console.log("[v0] Chat API: Detected dashboard interaction")

      let dashboardAction = null
      let responseMessage = ""

      // Report changes navigation
      if (/report.*change|change.*report/i.test(message)) {
        if (/income|job|employment|asset|financial/i.test(message)) {
          dashboardAction = {
            type: "navigate",
            destination: "/account",
            params: { tab: "report-changes", category: "income-assets" },
            message: "Taking you to report income and asset changes...",
          }
          responseMessage = "Taking you to report income and asset changes..."
        } else if (/household|family|marriage|divorce|baby|member/i.test(message)) {
          dashboardAction = {
            type: "navigate",
            destination: "/account",
            params: { tab: "report-changes", category: "household" },
            message: "Taking you to report household changes...",
          }
          responseMessage = "Taking you to report household changes..."
        } else if (/address|move|moved|relocat/i.test(message)) {
          dashboardAction = {
            type: "navigate",
            destination: "/account",
            params: { tab: "report-changes", category: "address" },
            message: "Taking you to report address changes...",
          }
          responseMessage = "Taking you to report address changes..."
        } else if (/insurance|health.*coverage|medicare/i.test(message)) {
          dashboardAction = {
            type: "navigate",
            destination: "/account",
            params: { tab: "report-changes", category: "insurance" },
            message: "Taking you to report insurance changes...",
          }
          responseMessage = "Taking you to report insurance changes..."
        } else {
          dashboardAction = {
            type: "navigate",
            destination: "/account",
            params: { tab: "report-changes" },
            message: "Taking you to report changes...",
          }
          responseMessage = "Taking you to report changes..."
        }
      }
      // Dashboard tab navigation
      else if (/overview/i.test(message)) {
        dashboardAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "overview" },
          message: "Taking you to dashboard overview...",
        }
        responseMessage = "Taking you to dashboard overview..."
      } else if (/applications/i.test(message)) {
        dashboardAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "applications" },
          message: "Taking you to your applications...",
        }
        responseMessage = "Taking you to your applications..."
      }

      if (dashboardAction && user && sessionId) {
        try {
          await saveChatMessage(user.id, sessionId, "user", message, context)
          await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, dashboardAction)
        } catch (error) {
          console.error("[v0] Chat API: Error saving dashboard interaction:", error)
        }

        return NextResponse.json({
          message: responseMessage,
          action: dashboardAction,
        })
      }
    }

    const isInformationalQuestion =
      /^(what|how|when|where|why|which|can you tell me|do you know|is there|are there|does this|explain|describe|will i)/i.test(
        message.trim(),
      ) ||
      /\b(what (states?|features?|benefits?|documents?)|which states?|how (does|do)|tell me about|social security|refugee|asylum)\b/i.test(
        message.toLowerCase(),
      )

    if (isInformationalQuestion) {
      let informationalResponse = ""

      if (/social security.*refugee|refugee.*social security|ssn.*refugee|refugee.*ssn/i.test(message)) {
        informationalResponse =
          "As a refugee, you may be eligible for a Social Security Number (SSN). Refugees who are authorized to work in the US can apply for an SSN at a Social Security Administration office. You'll need your refugee documentation (I-94 with refugee stamp or other USCIS documents) and identification. Having an SSN will help with benefit applications, employment, and other services. If you don't have an SSN yet, some benefit applications may still be processed using alternative documentation."
      } else if (/states?.*covered|states?.*work|which states?|what states?/i.test(message)) {
        informationalResponse =
          "This benefits application platform works for all 50 US states. You can select your state during the application process, and the system will provide state-specific requirements and processing information for your Medicaid and SNAP applications."
      } else if (/features?|what.*do|what.*have|capabilities/i.test(message)) {
        informationalResponse =
          "This platform offers several key features: 1) Apply for Medicaid and SNAP benefits with step-by-step guidance, 2) Save your progress and return later, 3) Get help with required documents and eligibility, 4) Report life changes to existing benefits, 5) Track your application status, and 6) Access your account dashboard with notifications and document management."
      } else if (/documents?.*need|what.*bring|required.*documents?/i.test(message)) {
        informationalResponse =
          "Required documents typically include: ID (driver's license or state ID), Social Security cards for all household members, proof of income (pay stubs, tax returns), bank statements, rent/mortgage receipts, and utility bills. The exact requirements may vary by state and benefit type."
      } else if (/eligibility|qualify|eligible/i.test(message)) {
        informationalResponse =
          "Eligibility is based on household size, income, assets, and other factors. Generally, SNAP serves households at or below 130% of federal poverty guidelines, while Medicaid eligibility varies by state. The application will help determine your specific eligibility."
      } else if (/how.*long|processing.*time|when.*approved/i.test(message)) {
        informationalResponse =
          "Processing times vary by state and benefit type. SNAP applications are typically processed within 30 days, while Medicaid can take 45-90 days. Emergency SNAP benefits may be available within 7 days for qualifying households."
      }

      if (informationalResponse) {
        if (user && sessionId) {
          try {
            await saveChatMessage(user.id, sessionId, "user", message, context)
            await saveChatMessage(user.id, sessionId, "assistant", informationalResponse)
          } catch (error) {
            console.error("[v0] Chat API: Error saving informational exchange:", error)
          }
        }

        return NextResponse.json({
          message: informationalResponse,
          action: null,
        })
      }
    }

    const isBenefitSelection =
      /^(medicaid|snap|both)$/i.test(message.trim()) ||
      /\b(select|choose|pick|want)\s+(medicaid|snap|both)\b/i.test(message.toLowerCase())

    const isStateSelection =
      /^[a-z\s]+$/i.test(message.trim()) &&
      message.trim().length > 2 &&
      message.trim().length < 30 &&
      !isInformationalQuestion &&
      !isSimpleNavigationRequest &&
      (context?.applicationContext?.currentStep === 1 ||
        /\b(select|choose|pick|from)\s+[a-z\s]+\b/i.test(message.toLowerCase()))

    const isFormInteraction =
      /^(both|medicaid|snap|[a-z]{2}|alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|district of columbia)/i.test(
        message.trim(),
      ) ||
      /^(first name|last name|name|email|phone|address|ssn|social security|citizenship|date of birth|dob|language)/i.test(
        message.trim(),
      ) ||
      /^(employed|unemployed|self.employed|retired|student|disabled|homemaker)/i.test(message.trim()) ||
      /^(yes|no|married|single|divorced|widowed|separated)/i.test(message.trim()) ||
      /^\$?\d+(\.\d{2})?$/i.test(message.trim()) ||
      /^(job.*change|new.*job|lost.*job|income.*increase|income.*decrease|got.*married|got.*divorced|new.*baby|someone.*moved|address.*change|moved.*to|new.*insurance|lost.*insurance|medicare)/i.test(
        message.trim(),
      )

    if (isFormInteraction) {
      console.log("[v0] Chat API: Detected form interaction")

      let formAction = null
      let responseMessage = ""

      // Benefit selection
      if (/^both$/i.test(message.trim())) {
        formAction = {
          type: "select_benefit",
          benefitType: "both",
        }
        responseMessage = "I've selected both Medicaid and SNAP benefits for you."
      } else if (/^medicaid$/i.test(message.trim())) {
        formAction = {
          type: "select_benefit",
          benefitType: "medicaid",
        }
        responseMessage = "I've selected Medicaid benefits for you."
      } else if (/^snap$/i.test(message.trim())) {
        formAction = {
          type: "select_benefit",
          benefitType: "snap",
        }
        responseMessage = "I've selected SNAP benefits for you."
      }
      // State selection
      else if (
        /^[a-z]{2}$/i.test(message.trim()) ||
        US_STATES.some(
          (state) =>
            state.name.toLowerCase() === message.trim().toLowerCase() ||
            state.code.toLowerCase() === message.trim().toLowerCase(),
        )
      ) {
        const stateInput = message.trim()
        const selectedState = US_STATES.find(
          (state) =>
            state.name.toLowerCase() === stateInput.toLowerCase() ||
            state.code.toLowerCase() === stateInput.toLowerCase(),
        )

        if (selectedState) {
          formAction = {
            type: "select_state",
            state: selectedState.name,
          }
          responseMessage = `I've selected ${selectedState.name} as your state.`
        }
      } else if (/job.*change|new.*job/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "income-assets",
          changeType: "job-change",
          details: message,
        }
        responseMessage = "I've noted your job change. Let me help you report this change."
      } else if (/lost.*job/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "income-assets",
          changeType: "job-change",
          details: message,
        }
        responseMessage = "I've noted your job loss. Let me help you report this change."
      } else if (/income.*increase|income.*decrease/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "income-assets",
          changeType: "income-change",
          details: message,
        }
        responseMessage = "I've noted your income change. Let me help you report this."
      } else if (/got.*married/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "household",
          changeType: "marriage",
          details: message,
        }
        responseMessage = "Congratulations! Let me help you report your marriage."
      } else if (/got.*divorced/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "household",
          changeType: "marriage",
          details: message,
        }
        responseMessage = "I've noted your divorce. Let me help you report this household change."
      } else if (/new.*baby/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "household",
          changeType: "add-member",
          details: message,
        }
        responseMessage = "Congratulations on your new baby! Let me help you report this household change."
      } else if (/address.*change|moved.*to/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "address",
          changeType: "address-change",
          details: message,
        }
        responseMessage = "I've noted your address change. Let me help you report this."
      } else if (/new.*insurance/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "insurance",
          changeType: "job-insurance",
          details: message,
        }
        responseMessage = "I've noted your new insurance. Let me help you report this change."
      } else if (/lost.*insurance/i.test(message)) {
        formAction = {
          type: "fill_report_change",
          category: "insurance",
          changeType: "lost-insurance",
          details: message,
        }
        responseMessage = "I've noted your insurance loss. Let me help you report this change."
      }

      if (formAction && user && sessionId) {
        try {
          await saveChatMessage(user.id, sessionId, "user", message, context)
          await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, formAction)
        } catch (error) {
          console.error("[v0] Chat API: Error saving form interaction:", error)
        }

        return NextResponse.json({
          message: responseMessage,
          action: formAction,
        })
      }
    }

    // Handle benefit selections
    if (isBenefitSelection && context?.applicationContext?.currentStep === 0) {
      let benefitType = ""
      let responseMessage = ""

      if (/both/i.test(message)) {
        benefitType = "both"
        responseMessage =
          "Perfect! I've selected both Medicaid and SNAP for your application. Now please select your state of residence."
      } else if (/medicaid/i.test(message)) {
        benefitType = "medicaid"
        responseMessage =
          "Great! I've selected Medicaid for your application. Now please select your state of residence."
      } else if (/snap/i.test(message)) {
        benefitType = "snap"
        responseMessage =
          "Excellent! I've selected SNAP for your application. Now please select your state of residence."
      }

      const formAction = {
        type: "select_benefit",
        benefitType: benefitType,
        message: responseMessage,
        nextStep: 1,
      }

      if (user && sessionId) {
        try {
          await saveChatMessage(user.id, sessionId, "user", message, context)
          await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, formAction)
        } catch (error) {
          console.error("[v0] Chat API: Error saving benefit selection:", error)
        }
      }

      return NextResponse.json({
        message: responseMessage,
        action: formAction,
        responseType: "form_interaction",
      })
    }

    // Handle state selections
    if (isStateSelection && context?.applicationContext?.currentStep === 1) {
      const stateName = message.trim()
      const responseMessage = `Perfect! I've selected ${stateName} as your state of residence. You can now proceed to the next step of the application.`

      const formAction = {
        type: "select_state",
        state: stateName,
        message: responseMessage,
        nextStep: 2,
      }

      if (user && sessionId) {
        try {
          await saveChatMessage(user.id, sessionId, "user", message, context)
          await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, formAction)
        } catch (error) {
          console.error("[v0] Chat API: Error saving state selection:", error)
        }
      }

      return NextResponse.json({
        message: responseMessage,
        action: formAction,
        responseType: "form_interaction",
      })
    }

    const appContext = context?.applicationContext

    const currentPath = context?.currentPath || "/"
    let contextPrompt = ""
    let relevantKnowledge = ""

    if (currentPath.includes("/application") && appContext) {
      const stepInfo = getStepGuidance(appContext.currentStep + 1)
      contextPrompt = `The user is currently on step ${appContext.currentStep + 1} of ${appContext.totalSteps} in the benefits application: "${appContext.stepTitle}". 
      They are applying for: ${appContext.benefitType || "not selected yet"}
      State: ${appContext.state || "not selected yet"}
      Progress: ${appContext.completedSteps}/${appContext.totalSteps} steps completed.`

      if (stepInfo) {
        relevantKnowledge = `
        CURRENT STEP DETAILS:
        - Required fields: ${stepInfo.requiredFields?.join(", ") || "See step description"}
        - Required documents: ${stepInfo.requiredDocuments?.join(", ") || "None specified"}
        - Tips: ${stepInfo.tips?.join("; ") || stepInfo.guidance || "Follow the form instructions"}
        `
      }
    } else if (currentPath.includes("/account")) {
      contextPrompt =
        "The user is currently viewing their account dashboard with tabs for Overview, Applications, Notifications, Documents, Profile, and Report Changes."
    } else if (currentPath === "/") {
      contextPrompt = "The user is currently on the homepage."
    } else if (currentPath === "/about") {
      contextPrompt = "The user is currently on the about page."
    }

    const systemPrompt = `You are a helpful benefits assistant for a government benefits platform. 

CORE PRINCIPLES:
- Answer questions directly and completely
- Provide specific eligibility information when asked
- Be helpful and informative without being overwhelming
- Use the knowledge base to provide accurate information

SNAP ELIGIBILITY QUICK REFERENCE:
- Income: Gross monthly income ≤ 130% of Federal Poverty Level
- Assets: $2,000 limit ($3,000 if household has elderly/disabled member)
- Work: Able-bodied adults 18-49 without dependents must work 20+ hours/week
- Citizenship: Must be U.S. citizen or qualified immigrant
- Household size affects income limits

RESPONSE GUIDELINES:
- For eligibility questions: Provide specific requirements and income limits
- For navigation requests: Navigate immediately 
- For document questions: List required documents clearly
- Be direct and helpful - don't ask for more details unless truly needed

PLATFORM INFORMATION:
- Serves all 50 US states with state-specific requirements
- Offers Medicaid and SNAP benefit applications
- Processing times: SNAP (30 days), Medicaid (45-90 days)`

    let conversationContext = ""
    if (enhancedConversationHistory && enhancedConversationHistory.length > 0) {
      const recentMessages = enhancedConversationHistory.slice(-6)
      conversationContext =
        "\n\nRECENT CONVERSATION:\n" + recentMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")
    }

    console.log("[v0] Chat API: About to call Groq API with enhanced configuration and conversation memory")

    const result = await streamText({
      model: groq("llama3-70b-8192"),
      prompt: `${systemPrompt}\n\n${contextPrompt}\n\n${relevantKnowledge}${conversationContext}\n\nUser: ${message}\nAssistant:`,
      maxTokens: 1200,
    })

    let fullText = ""
    for await (const chunk of result.textStream) {
      fullText += chunk
    }

    let cleanedResponse = fullText

    // Remove obvious template variables and placeholders
    cleanedResponse = cleanedResponse.replace(/\[State Name\]/gi, "your state")
    cleanedResponse = cleanedResponse.replace(/\[Your State\]/gi, "your state")
    cleanedResponse = cleanedResponse.replace(/\[INSERT_.*?\]/gi, "")

    // Remove empty template variables
    cleanedResponse = cleanedResponse.replace(/\{\s*\}/g, "")
    cleanedResponse = cleanedResponse.replace(/\$\{.*?\}/g, "")

    // Remove system instructions and internal directions (but preserve legitimate parenthetical content)
    cleanedResponse = cleanedResponse.replace(
      /\s*$$[^)]*(?:assistant navigates|internal instruction|system prompt|stage direction)[^)]*$$/gi,
      "",
    )

    // Remove assistant action descriptions
    cleanedResponse = cleanedResponse.replace(/$$The assistant .*?$$/gi, "")

    // Remove navigation instructions that aren't meant for users
    cleanedResponse = cleanedResponse.replace(
      /\.\.\.*\s*(?:I'll|I will|Let me) (?:navigate|guide|direct|take) (?:you|the user).*?(?=\.|$)/gi,
      "",
    )

    // Clean up spacing and formatting
    cleanedResponse = cleanedResponse
      .replace(/\.{3,}/g, "")
      .replace(/\s+/g, " ")
      .trim()

    // Remove empty parentheses or brackets left behind
    cleanedResponse = cleanedResponse.replace(/$$\s*$$/g, "").replace(/\[\s*\]/g, "")

    if (!cleanedResponse || cleanedResponse.length < 10) {
      cleanedResponse =
        "I'm having trouble generating a response right now. Could you try rephrasing your question about benefits?"
    }

    cleanedResponse = cleanedResponse.replace(
      /\s*$$[^)]*(?:assistant navigates|user to|internal instruction|system prompt)[^)]*$$/gi,
      "",
    )

    cleanedResponse = cleanedResponse.replace(/\[State Name\]/gi, "your state")
    cleanedResponse = cleanedResponse.replace(/\[.*?\]/g, "")

    cleanedResponse = cleanedResponse.replace(/\{.*?\}/g, "")
    cleanedResponse = cleanedResponse.replace(/\$\{.*?\}/g, "")

    // Remove content in parentheses that looks like internal instructions
    cleanedResponse = cleanedResponse.replace(
      /\s*$$[^)]*(?:style|leading|navigating|informative|action|internal|system|instruction|assistant navigates|user to|follows|stage direction)[^)]*$$/gi,
      "",
    )

    // Remove any remaining parenthetical instructions that contain technical terms
    cleanedResponse = cleanedResponse.replace(
      /\s*$$[^)]*(?:without explicitly|automatically|detection|flow|prompt|navigate.*user|guide.*user|direct.*user)[^)]*$$/gi,
      "",
    )

    // Remove stage directions and internal thoughts that aren't in parentheses
    cleanedResponse = cleanedResponse.replace(/\.\.\.\.*\s*Let me help you navigate.*?(?=\.|$)/gi, "")

    // Remove assistant action descriptions
    cleanedResponse = cleanedResponse.replace(/$$The assistant .*?$$/gi, "")

    // Remove internal navigation instructions
    cleanedResponse = cleanedResponse.replace(
      /\.\.\.\.*\s*(?:I'll|I will|Let me) (?:navigate|guide|direct|take) (?:you|the user).*?(?=\.|$)/gi,
      "",
    )

    cleanedResponse = cleanedResponse.replace(
      /Here's the application page for \[.*?\]/gi,
      "Here's your application page",
    )
    cleanedResponse = cleanedResponse.replace(/\[.*?\] part/gi, "")
    cleanedResponse = cleanedResponse.replace(/the \[.*?\] section/gi, "that section")

    // Clean up any double spaces, multiple dots, or trailing punctuation
    cleanedResponse = cleanedResponse
      .replace(/\.{3,}/g, "")
      .replace(/\s+/g, " ")
      .trim()

    // Remove any remaining empty parentheses or brackets
    cleanedResponse = cleanedResponse.replace(/$$\s*$$/g, "").replace(/\[\s*\]/g, "")

    let navigationAction = null

    const hasActionIntent =
      /\b(start|apply|help me (start|apply|do|report|submit)|take me|guide me|navigate me|i need to (start|apply|report|submit)|i want to (start|apply|report|submit)|can you (take|guide|navigate)|yes take me|yes|take me|show me|go to)/i.test(
        message.toLowerCase(),
      )

    const isConfirmation = /^(yes|yes take me|take me|go|do it|proceed|continue)$/i.test(message.trim())

    if (hasActionIntent && !isInformationalQuestion) {
      // ... existing navigation logic ...
      if (
        (message.toLowerCase().includes("notification") || message.toLowerCase().includes("notifications")) &&
        (message.toLowerCase().includes("show me") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("go to") ||
          message.toLowerCase().includes("view") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "notifications" },
          message: "Taking you to your notifications now...",
        }
      } else if (
        (message.toLowerCase().includes("application") && message.toLowerCase().includes("status")) ||
        ((message.toLowerCase().includes("my applications") ||
          message.toLowerCase().includes("submitted applications")) &&
          (message.toLowerCase().includes("show me") ||
            message.toLowerCase().includes("take me") ||
            message.toLowerCase().includes("navigate") ||
            message.toLowerCase().includes("go to") ||
            message.toLowerCase().includes("view") ||
            isConfirmation))
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "applications" },
          message: "Taking you to your applications now...",
        }
      } else if (
        (message.toLowerCase().includes("profile") || message.toLowerCase().includes("personal info")) &&
        (message.toLowerCase().includes("show me") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("go to") ||
          message.toLowerCase().includes("view") ||
          message.toLowerCase().includes("edit") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "profile" },
          message: "Taking you to your profile now...",
        }
      } else if (
        (message.toLowerCase().includes("document") || message.toLowerCase().includes("documents")) &&
        (message.toLowerCase().includes("show me") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("go to") ||
          message.toLowerCase().includes("view") ||
          message.toLowerCase().includes("upload") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "documents" },
          message: "Taking you to your documents now...",
        }
      } else if (
        (message.toLowerCase().includes("report changes") ||
          message.toLowerCase().includes("report change") ||
          message.toLowerCase().includes("life changes")) &&
        (message.toLowerCase().includes("show me") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("go to") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          params: { tab: "report-changes" },
          message: "Taking you to report changes now...",
        }
      }
      // Income section navigation - FIXED: Income is step 5, not step 4
      else if (
        (message.toLowerCase().includes("income") || message.toLowerCase().includes("add income")) &&
        (message.toLowerCase().includes("guide") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("section") ||
          message.toLowerCase().includes("input") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "false", step: "5" }, // Fixed step number from 4 to 5
          message: "Taking you to the income section of the application now...",
          prefill: {
            currentStep: 5,
          },
        }
      }
      // Assets section navigation
      else if (
        message.toLowerCase().includes("assets") &&
        (message.toLowerCase().includes("guide") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("section") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "false", step: "6" },
          message: "Taking you to the assets section of the application now...",
          prefill: {
            currentStep: 6,
          },
        }
      }
      // Health/Medical section navigation
      else if (
        (message.toLowerCase().includes("health") ||
          message.toLowerCase().includes("medical") ||
          message.toLowerCase().includes("disability")) &&
        (message.toLowerCase().includes("guide") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("section") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "false", step: "7" },
          message: "Taking you to the health and disability section of the application now...",
          prefill: {
            currentStep: 7,
          },
        }
      }
      // Personal information section navigation
      else if (
        (message.toLowerCase().includes("personal") || message.toLowerCase().includes("personal information")) &&
        (message.toLowerCase().includes("guide") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("section") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "false", step: "2" },
          message: "Taking you to the personal information section of the application now...",
          prefill: {
            currentStep: 2,
          },
        }
      }
      // Household members section navigation
      else if (
        (message.toLowerCase().includes("household members") || message.toLowerCase().includes("add household")) &&
        (message.toLowerCase().includes("guide") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("section") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "false", step: "3" },
          message: "Taking you to the household members section of the application now...",
          prefill: {
            currentStep: 3,
          },
        }
      }
      // Review section navigation
      else if (
        (message.toLowerCase().includes("review") || message.toLowerCase().includes("submit")) &&
        (message.toLowerCase().includes("guide") ||
          message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("section") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "false", step: "8" },
          message: "Taking you to the review and submit section of the application now...",
          prefill: {
            currentStep: 8,
          },
        }
      }
      // Dashboard navigation
      else if (
        message.toLowerCase().includes("dashboard") &&
        (message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("go to") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          message: "Taking you to your dashboard now...",
        }
      }
      // About page navigation
      else if (
        message.toLowerCase().includes("about") &&
        (message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("go to") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/about",
          message: "Taking you to the about page now...",
        }
      }
      // Homepage navigation
      else if (
        (message.toLowerCase().includes("home") || message.toLowerCase().includes("homepage")) &&
        (message.toLowerCase().includes("take me") ||
          message.toLowerCase().includes("navigate") ||
          message.toLowerCase().includes("go to") ||
          isConfirmation)
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/",
          message: "Taking you to the homepage now...",
        }
      }
      // SNAP application detection
      else if (
        (message.toLowerCase().includes("start") ||
          message.toLowerCase().includes("apply") ||
          message.toLowerCase().includes("help me")) &&
        (message.toLowerCase().includes("snap") || message.toLowerCase().includes("food"))
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "true", benefit: "snap" },
          message: "Taking you to the SNAP application now with SNAP benefits pre-selected...",
          prefill: {
            benefitType: "snap",
          },
        }
      }
      // Medicaid application detection
      else if (
        (message.toLowerCase().includes("start") ||
          message.toLowerCase().includes("apply") ||
          message.toLowerCase().includes("help me")) &&
        message.toLowerCase().includes("medicaid")
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "true", benefit: "medicaid" },
          message: "Taking you to the Medicaid application now with Medicaid pre-selected...",
          prefill: {
            benefitType: "medicaid",
          },
        }
      }
      // Both benefits application detection
      else if (
        (message.toLowerCase().includes("start") ||
          message.toLowerCase().includes("apply") ||
          message.toLowerCase().includes("help me")) &&
        (message.toLowerCase().includes("both") ||
          (message.toLowerCase().includes("medicaid") && message.toLowerCase().includes("snap")))
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/application",
          params: { fresh: "true", benefit: "both" },
          message: "Taking you to the application now with both Medicaid and SNAP pre-selected...",
          prefill: {
            benefitType: "both",
          },
        }
      }
      // Household changes (baby, child, marriage, etc.) - but only for action requests
      else if (
        message.toLowerCase().includes("child") ||
        message.toLowerCase().includes("baby") ||
        message.toLowerCase().includes("birth") ||
        message.toLowerCase().includes("married") ||
        message.toLowerCase().includes("divorce")
      ) {
        const changeType = message.toLowerCase().includes("married")
          ? "marriage"
          : message.toLowerCase().includes("divorce")
            ? "divorce"
            : "add-member"
        navigationAction = {
          type: "navigate",
          destination: "/account",
          tabName: "report-changes",
          category: "household",
          subtype: changeType,
          message: `Taking you to report household changes now... I've pre-selected '${changeType === "marriage" ? "Marriage" : changeType === "divorce" ? "Divorce" : "Add new household member"}'. Would you like help with the details?`,
          prefill: {
            changeType:
              changeType === "marriage"
                ? "Marriage"
                : changeType === "divorce"
                  ? "Divorce"
                  : "Add new household member",
          },
        }
      }
      // Job/income changes - but only for action requests
      else if (message.toLowerCase().includes("job") || message.toLowerCase().includes("employment")) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          tabName: "report-changes",
          category: "income",
          subtype: "job-change",
          message:
            "Taking you to report income changes now... I've pre-selected 'Employment change'. Would you like help with the income details?",
          prefill: {
            changeType: "Employment change",
          },
        }
      }
      // Address changes - but only for action requests
      else if (
        message.toLowerCase().includes("moved") ||
        message.toLowerCase().includes("address") ||
        message.toLowerCase().includes("relocat")
      ) {
        navigationAction = {
          type: "navigate",
          destination: "/account",
          tabName: "report-changes",
          category: "address",
          message:
            "Taking you to report address changes now... I've pre-selected 'Address change'. Would you like help with the details?",
          prefill: {
            changeType: "Address change",
          },
        }
      }
    }

    const dashboardMatch = cleanedResponse.match(
      /I'll take you to (?:the )?Dashboard|navigate you to (?:the )?Dashboard/i,
    )
    const reportChangesMatch = cleanedResponse.match(
      /I'll take you to (?:the )?Report Changes|navigate you to (?:the )?Report Changes/i,
    )

    if (reportChangesMatch) {
      navigationAction = {
        type: "navigate",
        destination: "/account",
        tabName: "report-changes",
        message: "Taking you to Report Changes...",
      }
    } else if (dashboardMatch) {
      navigationAction = {
        type: "navigate",
        destination: "/account",
        message: "Taking you to your Dashboard...",
      }
    }

    const isPersonalInfoInput =
      /^(first name|last name|name|email|phone|address|ssn|social security|citizenship|date of birth|dob|language)/i.test(
        message.trim(),
      ) ||
      /\b(my name is|i'm|call me|email is|phone is|address is|born on|citizen|speak)\b/i.test(message.toLowerCase())

    const isIncomeInput =
      /\b(income|salary|wages|job|employer|work|employment|unemployed|retired|disability income|social security income)\b/i.test(
        message.toLowerCase(),
      ) || /\$\d+|\d+\s*(dollars?|per|hour|month|year|weekly|annually)/i.test(message)

    const isAssetInput =
      /\b(bank account|savings|checking|vehicle|car|truck|life insurance|assets|property)\b/i.test(
        message.toLowerCase(),
      ) || /\b(own a|have a|my car|my truck|bank balance|account balance)\b/i.test(message.toLowerCase())

    const isHealthInput =
      /\b(health insurance|medical|disability|disabled|pregnant|pregnancy|chronic condition|medication)\b/i.test(
        message.toLowerCase(),
      ) || /\b(have insurance|need medical|health problems|taking medication)\b/i.test(message.toLowerCase())

    const isHouseholdInput =
      /\b(household|family|spouse|child|children|parent|sibling|live with|household member)\b/i.test(
        message.toLowerCase(),
      ) || /\b(add member|family size|people in household)\b/i.test(message.toLowerCase())

    // Handle personal information inputs
    if (isPersonalInfoInput && context?.applicationContext?.currentStep === 2) {
      let fieldType = ""
      let value = ""
      let responseMessage = ""

      if (/first name|my name is|call me/i.test(message)) {
        fieldType = "firstName"
        value = message.replace(/^(first name|my name is|call me)\s*/i, "").trim()
        responseMessage = `I've entered "${value}" as your first name.`
      } else if (/last name/i.test(message)) {
        fieldType = "lastName"
        value = message.replace(/^last name\s*/i, "").trim()
        responseMessage = `I've entered "${value}" as your last name.`
      } else if (/email/i.test(message)) {
        fieldType = "email"
        const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/)
        value = emailMatch ? emailMatch[0] : message.replace(/^email\s*(is)?\s*/i, "").trim()
        responseMessage = `I've entered "${value}" as your email address.`
      } else if (/phone/i.test(message)) {
        fieldType = "phone"
        const phoneMatch = message.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)
        value = phoneMatch ? phoneMatch[0] : message.replace(/^phone\s*(is|number)?\s*/i, "").trim()
        responseMessage = `I've entered "${value}" as your phone number.`
      } else if (/address/i.test(message)) {
        fieldType = "address"
        value = message.replace(/^address\s*(is)?\s*/i, "").trim()
        responseMessage = `I've entered "${value}" as your address.`
      }

      if (fieldType && value) {
        const formAction = {
          type: "fill_personal_info",
          fieldType: fieldType,
          value: value,
          message: responseMessage,
        }

        if (user && sessionId) {
          try {
            await saveChatMessage(user.id, sessionId, "user", message, context)
            await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, formAction)
          } catch (error) {
            console.error("[v0] Chat API: Error saving personal info input:", error)
          }
        }

        return NextResponse.json({
          message: responseMessage,
          action: formAction,
          responseType: "form_interaction",
        })
      }
    }

    // Handle income and employment inputs
    if (isIncomeInput && context?.applicationContext?.currentStep === 5) {
      let responseMessage = ""
      let formAction = null

      if (/unemployed|not working|no job/i.test(message)) {
        responseMessage =
          "I've noted that you're currently unemployed. This information will be recorded in your employment section."
        formAction = {
          type: "fill_employment",
          status: "unemployed",
          message: responseMessage,
        }
      } else if (/retired/i.test(message)) {
        responseMessage = "I've noted that you're retired. This will be recorded in your employment section."
        formAction = {
          type: "fill_employment",
          status: "retired",
          message: responseMessage,
        }
      } else if (/work at|employed at|job at/i.test(message)) {
        const employer = message.replace(/^.*(work at|employed at|job at)\s*/i, "").trim()
        responseMessage = `I've entered "${employer}" as your employer.`
        formAction = {
          type: "fill_employment",
          employer: employer,
          status: "employed",
          message: responseMessage,
        }
      } else if (/\$\d+|\d+\s*(dollars?|per|hour|month|year)/i.test(message)) {
        const incomeMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i)
        const income = incomeMatch ? incomeMatch[1] : ""
        responseMessage = `I've recorded $${income} as income information.`
        formAction = {
          type: "fill_income",
          amount: income,
          message: responseMessage,
        }
      }

      if (formAction) {
        if (user && sessionId) {
          try {
            await saveChatMessage(user.id, sessionId, "user", message, context)
            await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, formAction)
          } catch (error) {
            console.error("[v0] Chat API: Error saving income input:", error)
          }
        }

        return NextResponse.json({
          message: responseMessage,
          action: formAction,
          responseType: "form_interaction",
        })
      }
    }

    // Handle asset inputs
    if (isAssetInput && context?.applicationContext?.currentStep === 6) {
      let responseMessage = ""
      let formAction = null

      if (/bank account|savings|checking/i.test(message)) {
        const balanceMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i)
        const balance = balanceMatch ? balanceMatch[1] : ""
        responseMessage = balance
          ? `I've recorded a bank account with $${balance} balance.`
          : "I've noted that you have a bank account. Please provide the balance amount."
        formAction = {
          type: "fill_assets",
          assetType: "bank_account",
          balance: balance,
          message: responseMessage,
        }
      } else if (/vehicle|car|truck/i.test(message)) {
        const valueMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i)
        const value = valueMatch ? valueMatch[1] : ""
        responseMessage = value
          ? `I've recorded a vehicle worth $${value}.`
          : "I've noted that you have a vehicle. Please provide its estimated value."
        formAction = {
          type: "fill_assets",
          assetType: "vehicle",
          value: value,
          message: responseMessage,
        }
      }

      if (formAction) {
        if (user && sessionId) {
          try {
            await saveChatMessage(user.id, sessionId, "user", message, context)
            await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, formAction)
          } catch (error) {
            console.error("[v0] Chat API: Error saving asset input:", error)
          }
        }

        return NextResponse.json({
          message: responseMessage,
          action: formAction,
          responseType: "form_interaction",
        })
      }
    }

    // Handle health and disability inputs
    if (isHealthInput && context?.applicationContext?.currentStep === 7) {
      let responseMessage = ""
      let formAction = null

      if (/disabled|disability/i.test(message)) {
        responseMessage =
          "I've noted that there is a disability in your household. This information will be recorded in the health section."
        formAction = {
          type: "fill_health",
          fieldType: "disability",
          value: "yes",
          message: responseMessage,
        }
      } else if (/pregnant|pregnancy/i.test(message)) {
        responseMessage = "I've noted pregnancy information. This will be recorded in the health section."
        formAction = {
          type: "fill_health",
          fieldType: "pregnancy",
          value: "yes",
          message: responseMessage,
        }
      } else if (/health insurance|have insurance/i.test(message)) {
        responseMessage = "I've noted that you have health insurance. This information will be recorded."
        formAction = {
          type: "fill_health",
          fieldType: "insurance",
          value: "yes",
          message: responseMessage,
        }
      }

      if (formAction) {
        if (user && sessionId) {
          try {
            await saveChatMessage(user.id, sessionId, "user", message, context)
            await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, formAction)
          } catch (error) {
            console.error("[v0] Chat API: Error saving health input:", error)
          }
        }

        return NextResponse.json({
          message: responseMessage,
          action: formAction,
          responseType: "form_interaction",
        })
      }
    }

    // Handle household member inputs
    if (isHouseholdInput && context?.applicationContext?.currentStep === 3) {
      let responseMessage = ""
      let formAction = null

      if (/spouse|married/i.test(message)) {
        responseMessage = "I've noted that you have a spouse. You can add them as a household member."
        formAction = {
          type: "fill_household",
          memberType: "spouse",
          message: responseMessage,
        }
      } else if (/child|children|kids/i.test(message)) {
        const numberMatch = message.match(/(\d+)\s*(child|children|kids)/i)
        const count = numberMatch ? numberMatch[1] : "1"
        responseMessage = `I've noted that you have ${count} child${count !== "1" ? "ren" : ""}. You can add them as household members.`
        formAction = {
          type: "fill_household",
          memberType: "child",
          count: count,
          message: responseMessage,
        }
      } else if (/live with|household size|family size/i.test(message)) {
        const sizeMatch = message.match(/(\d+)\s*(people|person|member)/i)
        const size = sizeMatch ? sizeMatch[1] : ""
        responseMessage = size
          ? `I've noted your household size of ${size} people.`
          : "I've noted information about your household size."
        formAction = {
          type: "fill_household",
          householdSize: size,
          message: responseMessage,
        }
      }

      if (formAction) {
        if (user && sessionId) {
          try {
            await saveChatMessage(user.id, sessionId, "user", message, context)
            await saveChatMessage(user.id, sessionId, "assistant", responseMessage, null, formAction)
          } catch (error) {
            console.error("[v0] Chat API: Error saving household input:", error)
          }
        }

        return NextResponse.json({
          message: responseMessage,
          action: formAction,
          responseType: "form_interaction",
        })
      }
    }

    if (user && sessionId) {
      try {
        await saveChatMessage(user.id, sessionId, "user", message, context)
        await saveChatMessage(user.id, sessionId, "assistant", cleanedResponse, null, navigationAction)
      } catch (error) {
        console.error("[v0] Chat API: Error saving conversation:", error)
        // Continue without failing the request
      }
    }

    const response = {
      message: cleanedResponse,
      action: navigationAction,
    }

    console.log("[v0] Chat API: Sending response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Chat API: Error occurred:", error)
    console.error("[v0] Chat API: Error message:", error.message)

    if (error.message?.includes("rate limit")) {
      return NextResponse.json({ error: "Service temporarily busy, please try again" }, { status: 429 })
    }
    if (error.message?.includes("authentication")) {
      return NextResponse.json({ error: "Service configuration issue" }, { status: 503 })
    }

    return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 })
  }
}
