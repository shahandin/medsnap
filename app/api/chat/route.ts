import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { getStepGuidance } from "@/lib/chat-knowledge-base"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Chat API: Starting request processing")

    const requestData = await request.json()
    const { message, context, conversationHistory } = requestData

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log("[v0] Chat API: Processing message:", message)
    console.log("[v0] Chat API: Context:", context)

    const isInformationalQuestion =
      /^(what|how|when|where|why|which|can you tell me|do you know|is there|are there|does this|explain|describe)/i.test(
        message.trim(),
      ) ||
      /\b(what (states?|features?|benefits?|documents?)|which states?|how (does|do)|tell me about)\b/i.test(
        message.toLowerCase(),
      )

    if (isInformationalQuestion) {
      let informationalResponse = ""

      if (/states?.*covered|states?.*work|which states?|what states?/i.test(message)) {
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
        return NextResponse.json({
          message: informationalResponse,
          action: null,
        })
      }
    }

    const currentPath = context?.currentPath || "/"
    const appContext = context?.applicationContext
    let contextPrompt = ""
    let relevantKnowledge = ""

    if (currentPath.includes("/application") && appContext) {
      const stepInfo = getStepGuidance(appContext.currentStep + 1)
      contextPrompt = `The user is currently on step ${appContext.currentStep + 1} of ${appContext.totalSteps} in the benefits application: "${appContext.stepTitle}". 
      They are applying for: ${appContext.benefitType || "not selected yet"}
      State: ${appContext.state || "not selected yet"}
      Progress: ${appContext.completedSteps}/${appContext.totalSteps} steps completed.
      Current section: ${appContext.stepDescription}`

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
      relevantKnowledge = `
      ACCOUNT DASHBOARD FEATURES:
      - Overview: Application status and quick actions
      - Applications: View submitted applications and their status
      - Notifications: Important updates and reminders
      - Documents: Upload additional required documents
      - Profile: Update personal information and settings
      - Report Changes: Report life changes that affect benefits (household size, income, address, insurance)
      
      REPORTING CHANGES WORKFLOW:
      For household changes (new child, baby):
      1. Navigate to Dashboard → Report Changes → Household Changes → Pre-select "Add new household member"
      2. Job change → Navigate to Dashboard → Report Changes → Income Changes → Pre-select "Employment change"
      3. Address move → Navigate to Dashboard → Report Changes → Address Changes → Pre-select "Address change"
      4. Marriage/divorce → Navigate to Dashboard → Report Changes → Household Changes → Pre-select appropriate option
      `
    } else if (currentPath === "/") {
      contextPrompt = "The user is currently on the homepage."
    } else if (currentPath === "/about") {
      contextPrompt = "The user is currently on the about page."
    }

    const systemPrompt = `You are a helpful benefits assistant for a government benefits platform. You provide both informational support and can help users navigate to complete tasks.

CORE PRINCIPLES:
- Answer informational questions directly and helpfully
- When users want to take action, AUTOMATICALLY navigate them - never ask for technical commands
- Be supportive and never tell users to stop asking questions
- Provide clear, accurate information about the platform and benefits

WHEN TO NAVIGATE vs WHEN TO INFORM:
- INFORM: Questions starting with "What", "How", "When", "Where", "Why", "Which", "Can you tell me", "Do you know"
- NAVIGATE: Clear action requests with verbs like "start", "apply", "help me do", "take me to", "I want to", "I need to", "guide me", "navigate me"

PLATFORM INFORMATION:
- Serves all 50 US states with state-specific requirements
- Offers Medicaid and SNAP benefit applications
- Features: step-by-step guidance, progress saving, document help, change reporting, status tracking
- Processing times: SNAP (30 days), Medicaid (45-90 days), Emergency SNAP (7 days)
- Required documents: ID, Social Security cards, income proof, bank statements, housing costs

NAVIGATION BEHAVIOR:
- When users ask to be taken somewhere, IMMEDIATELY navigate them
- Never ask users to say technical commands like "FLOW:anything"
- Never claim navigation happened when it didn't
- Be honest about what you can and cannot do
- If navigation fails, acknowledge it and offer alternatives

RESPONSE STYLE:
- Be conversational and helpful
- Never use technical jargon with users
- Always be encouraging and supportive
- Provide actionable guidance`

    let conversationContext = ""
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-6)
      conversationContext =
        "\n\nRECENT CONVERSATION:\n" + recentMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")
    }

    console.log("[v0] Chat API: About to call Groq API with balanced approach")

    const result = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: `${systemPrompt}\n\n${contextPrompt}\n\n${relevantKnowledge}${conversationContext}\n\nUser: ${message}\nAssistant:`,
      maxTokens: 400,
    })

    console.log("[v0] Chat API: Generated response:", result.text)

    let cleanedResponse = result.text

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

    const response = {
      message: cleanedResponse, // Use cleaned response instead of raw result.text
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
