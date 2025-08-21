interface UserBehavior {
  pageLoadTime: number
  timeOnPage: number
  scrollActivity: number
  formInteractions: number
  validationErrors: string[]
  repeatVisits: number
  lastActivity: number
}

interface ProactiveMessage {
  id: string
  type: "help_offer" | "progress_nudge" | "error_assistance" | "completion_reminder" | "document_help"
  content: string
  priority: "low" | "medium" | "high"
  trigger: string
  actionItems?: string[]
  navigationSuggestion?: {
    destination: string
    params?: Record<string, string>
    message: string
  }
}

export class ProactiveAssistanceManager {
  private behavior: UserBehavior
  private triggers: Map<string, number> = new Map()
  private lastProactiveMessage = 0
  private messageHistory: string[] = []

  constructor() {
    this.behavior = {
      pageLoadTime: Date.now(),
      timeOnPage: 0,
      scrollActivity: 0,
      formInteractions: 0,
      validationErrors: [],
      repeatVisits: this.getRepeatVisits(),
      lastActivity: Date.now(),
    }

    this.initializeTracking()
  }

  private initializeTracking() {
    if (typeof window === "undefined") return

    // Track time on page
    setInterval(() => {
      this.behavior.timeOnPage = Date.now() - this.behavior.pageLoadTime
    }, 1000)

    // Track scroll activity
    let scrollTimeout: NodeJS.Timeout
    window.addEventListener("scroll", () => {
      this.behavior.scrollActivity++
      this.behavior.lastActivity = Date.now()

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.checkForProactiveHelp()
      }, 2000)
    })

    // Track form interactions
    document.addEventListener("input", () => {
      this.behavior.formInteractions++
      this.behavior.lastActivity = Date.now()
    })

    document.addEventListener("click", () => {
      this.behavior.lastActivity = Date.now()
    })

    // Check for proactive help periodically
    setInterval(() => {
      this.checkForProactiveHelp()
    }, 30000) // Every 30 seconds
  }

  private getRepeatVisits(): number {
    if (typeof window === "undefined") return 0

    const visits = localStorage.getItem("benefit_bridge_visits")
    const count = visits ? Number.parseInt(visits) : 0
    localStorage.setItem("benefit_bridge_visits", (count + 1).toString())
    return count + 1
  }

  private shouldShowProactiveMessage(): boolean {
    const timeSinceLastMessage = Date.now() - this.lastProactiveMessage
    return timeSinceLastMessage > 60000 // At least 1 minute between proactive messages
  }

  private checkForProactiveHelp() {
    if (!this.shouldShowProactiveMessage()) return

    const context = (window as any).applicationContext
    if (!context) return

    const messages = this.generateProactiveMessages(context)
    const highPriorityMessage = messages.find((msg) => msg.priority === "high")
    const mediumPriorityMessage = messages.find((msg) => msg.priority === "medium")

    const messageToShow = highPriorityMessage || mediumPriorityMessage
    if (messageToShow && !this.messageHistory.includes(messageToShow.id)) {
      this.showProactiveMessage(messageToShow)
    }
  }

  private generateProactiveMessages(context: any): ProactiveMessage[] {
    const messages: ProactiveMessage[] = []
    const timeOnPage = this.behavior.timeOnPage / 1000 // Convert to seconds
    const timeSinceActivity = (Date.now() - this.behavior.lastActivity) / 1000

    // User has been on page for a while without much activity
    if (timeOnPage > 120 && timeSinceActivity > 60 && this.behavior.formInteractions < 3) {
      messages.push({
        id: "stuck_on_page",
        type: "help_offer",
        content: `I notice you've been on the ${context.stepTitle} step for a while. Would you like some help getting started?`,
        priority: "high",
        trigger: "inactivity",
        actionItems: ["Get step-by-step guidance", "See required documents", "Ask specific questions"],
      })
    }

    // User has validation errors
    if (context.hasValidationErrors && context.validationErrors.length > 0) {
      messages.push({
        id: "validation_help",
        type: "error_assistance",
        content: `I can help you fix the ${context.validationErrors.length} required field${context.validationErrors.length > 1 ? "s" : ""} to continue to the next step.`,
        priority: "high",
        trigger: "validation_errors",
        actionItems: ["Show me what to fix", "Explain required fields", "Help with specific errors"],
      })
    }

    // User is close to completing a step but hasn't finished
    if (context.currentStepCompletion > 70 && context.currentStepCompletion < 100 && timeOnPage > 180) {
      messages.push({
        id: "completion_nudge",
        type: "completion_reminder",
        content: `You're ${context.currentStepCompletion}% done with ${context.stepTitle}! Just a few more fields to complete this step.`,
        priority: "medium",
        trigger: "near_completion",
        actionItems: ["Show remaining fields", "Complete this step", "Get help with specific fields"],
      })
    }

    // User might need document help based on current step
    if (this.isDocumentHeavyStep(context.currentStep) && timeOnPage > 90) {
      messages.push({
        id: "document_assistance",
        type: "document_help",
        content: `This step requires several documents. Would you like help understanding what you need and where to find them?`,
        priority: "medium",
        trigger: "document_step",
        actionItems: ["See required documents", "Get document tips", "Learn where to find documents"],
      })
    }

    // First-time user guidance
    if (this.behavior.repeatVisits <= 2 && context.currentStep === 0 && timeOnPage > 60) {
      messages.push({
        id: "first_time_help",
        type: "help_offer",
        content: `Welcome to BenefitBridge! This is your first time here. Would you like a quick overview of how the application process works?`,
        priority: "medium",
        trigger: "first_visit",
        actionItems: ["Get application overview", "See what documents I need", "Learn about benefits"],
      })
    }

    // Progress encouragement for users making good progress
    if (context.progressPercentage > 50 && context.progressPercentage < 80 && !context.hasValidationErrors) {
      messages.push({
        id: "progress_encouragement",
        type: "progress_nudge",
        content: `Great progress! You're ${Math.round(context.progressPercentage)}% complete. You're doing well - keep going!`,
        priority: "low",
        trigger: "good_progress",
        actionItems: ["See what's next", "Get progress summary", "Continue application"],
      })
    }

    // User has been away and came back
    if (timeSinceActivity > 300 && timeOnPage > 600) {
      // 5 minutes inactive, 10 minutes total
      messages.push({
        id: "welcome_back",
        type: "help_offer",
        content: `Welcome back! You were working on ${context.stepTitle}. Would you like a quick reminder of where you left off?`,
        priority: "medium",
        trigger: "return_user",
        actionItems: ["Show progress summary", "Continue where I left off", "Get step guidance"],
      })
    }

    return messages
  }

  private isDocumentHeavyStep(step: number): boolean {
    // Steps that typically require many documents
    return [2, 5, 6, 7].includes(step) // Personal info, Income, Assets, Health
  }

  private showProactiveMessage(message: ProactiveMessage) {
    this.lastProactiveMessage = Date.now()
    this.messageHistory.push(message.id)

    // Dispatch custom event that the chat component can listen to
    const event = new CustomEvent("proactiveMessage", {
      detail: message,
    })
    window.dispatchEvent(event)
  }

  public updateValidationErrors(errors: string[]) {
    this.behavior.validationErrors = errors
  }

  public recordFormInteraction() {
    this.behavior.formInteractions++
    this.behavior.lastActivity = Date.now()
  }

  public recordPageChange() {
    this.behavior.pageLoadTime = Date.now()
    this.behavior.timeOnPage = 0
    this.behavior.scrollActivity = 0
    this.behavior.formInteractions = 0
    this.behavior.lastActivity = Date.now()
  }
}

// Singleton instance
let proactiveManager: ProactiveAssistanceManager | null = null

export function getProactiveAssistanceManager(): ProactiveAssistanceManager {
  if (typeof window === "undefined") {
    // Return a mock manager for server-side rendering
    return {
      updateValidationErrors: () => {},
      recordFormInteraction: () => {},
      recordPageChange: () => {},
    } as any
  }

  if (!proactiveManager) {
    proactiveManager = new ProactiveAssistanceManager()
  }
  return proactiveManager
}

export function generateContextualSuggestions(context: any): string[] {
  const suggestions: string[] = []

  if (context.hasValidationErrors) {
    suggestions.push("Help me fix the required fields")
    suggestions.push("What information is missing?")
  }

  if (context.currentStepCompletion < 50) {
    suggestions.push("Guide me through this step")
    suggestions.push("What documents do I need?")
  }

  if (context.currentStep > 0) {
    suggestions.push("Show my progress summary")
    suggestions.push("What's coming up next?")
  }

  // Step-specific suggestions
  switch (context.currentStep) {
    case 0:
      suggestions.push("Which benefits should I apply for?")
      suggestions.push("What's the difference between SNAP and Medicaid?")
      break
    case 2:
      suggestions.push("What documents do I need for personal info?")
      suggestions.push("Help with address verification")
      break
    case 5:
      suggestions.push("How do I report self-employment income?")
      suggestions.push("What expenses can I deduct?")
      break
    case 6:
      suggestions.push("Do I need to report my car?")
      suggestions.push("What assets count toward limits?")
      break
  }

  return suggestions.slice(0, 4) // Limit to 4 suggestions
}
