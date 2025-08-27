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

    // this.initializeTracking()
  }

  private initializeTracking() {
    return
  }

  private getRepeatVisits(): number {
    if (typeof window === "undefined") return 0

    const visits = localStorage.getItem("benefit_bridge_visits")
    const count = visits ? Number.parseInt(visits) : 0
    localStorage.setItem("benefit_bridge_visits", (count + 1).toString())
    return count + 1
  }

  private shouldShowProactiveMessage(): boolean {
    return false
  }

  private checkForProactiveHelp() {
    return
  }

  private generateProactiveMessages(context: any): ProactiveMessage[] {
    return []
  }

  private isDocumentHeavyStep(step: number): boolean {
    // Steps that typically require many documents
    return [2, 5, 6, 7].includes(step) // Personal info, Income, Assets, Health
  }

  private showProactiveMessage(message: ProactiveMessage) {
    return
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
