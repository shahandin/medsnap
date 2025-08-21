"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, X, Send, Bot, User, Navigation, Lightbulb, HelpCircle } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { getProactiveAssistanceManager, generateContextualSuggestions } from "@/lib/proactive-assistance"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isProactive?: boolean
  action?: {
    type: string
    destination?: string
    stepNumber?: number
    message?: string
    tabName?: string
    category?: string
    subtype?: string
    prefill?: any
    params?: Record<string, string>
  }
}

interface ProactiveMessage {
  id: string
  type: "help_offer" | "progress_nudge" | "error_assistance" | "completion_reminder" | "document_help"
  content: string
  priority: "low" | "medium" | "high"
  trigger: string
  actionItems?: string[]
}

export function GlobalAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your benefits assistant. I can help you navigate the application, answer questions about required documents, guide you through the process, and help you report changes to existing benefits. What can I help you with?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([])
  const [hasNewProactiveMessage, setHasNewProactiveMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const autoResize = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(textarea.scrollHeight, 120) // Max height of ~4 lines
      textarea.style.height = `${newHeight}px`

      if (textarea.scrollHeight > 120) {
        textarea.style.overflowY = "auto"
      } else {
        textarea.style.overflowY = "hidden"
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    autoResize()
  }, [inputValue])

  useEffect(() => {
    const proactiveManager = getProactiveAssistanceManager()

    // Listen for proactive messages
    const handleProactiveMessage = (event: CustomEvent) => {
      const proactiveMsg = event.detail as ProactiveMessage

      const message: Message = {
        id: `proactive_${Date.now()}`,
        content: proactiveMsg.content,
        role: "assistant",
        timestamp: new Date(),
        isProactive: true,
      }

      setMessages((prev) => [...prev, message])
      setHasNewProactiveMessage(true)

      // Auto-open chat for high priority messages
      if (proactiveMsg.priority === "high" && !isOpen) {
        setIsOpen(true)
      }
    }

    window.addEventListener("proactiveMessage", handleProactiveMessage as EventListener)

    // Update contextual suggestions based on application context
    const updateSuggestions = () => {
      const appContext = (window as any).applicationContext
      if (appContext) {
        const suggestions = generateContextualSuggestions(appContext)
        setContextualSuggestions(suggestions)

        // Update proactive manager with current validation errors
        proactiveManager.updateValidationErrors(appContext.validationErrors || [])
      }
    }

    updateSuggestions()
    const interval = setInterval(updateSuggestions, 5000) // Update every 5 seconds

    return () => {
      window.removeEventListener("proactiveMessage", handleProactiveMessage as EventListener)
      clearInterval(interval)
    }
  }, [isOpen])

  useEffect(() => {
    const proactiveManager = getProactiveAssistanceManager()
    proactiveManager.recordPageChange()
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      setHasNewProactiveMessage(false)
    }
  }, [isOpen])

  const handleNavigation = (
    destination: string,
    stepNumber?: number,
    message?: string,
    tabName?: string,
    category?: string,
    subtype?: string,
    prefill?: any,
    params?: Record<string, string>,
  ) => {
    setIsNavigating(true)

    const navigationMessage: Message = {
      id: (Date.now() + 2).toString(),
      content:
        message ||
        `Taking you to ${destination === "/account" ? "Dashboard" : destination === "/" ? "Homepage" : destination === "/about" ? "About page" : "Apply for Benefits"}...`,
      role: "assistant",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, navigationMessage])

    setTimeout(() => {
      let url = destination
      const urlParams = new URLSearchParams()

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          urlParams.set(key, value)
        })
      }

      if (stepNumber !== undefined) {
        urlParams.set("step", stepNumber.toString())
      }
      if (tabName) {
        urlParams.set("tab", tabName)
      }
      if (category) {
        urlParams.set("category", category)
      }
      if (subtype) {
        urlParams.set("subtype", subtype)
      }
      if (prefill) {
        urlParams.set("prefill", JSON.stringify(prefill))
      }

      if (urlParams.toString()) {
        url += `?${urlParams.toString()}`
      }

      console.log("[v0] Navigating to:", url)

      router.push(url)
      setIsNavigating(false)

      if (destination !== "/account") {
        setTimeout(() => {
          setIsOpen(false)
        }, 1000)
      }
    }, 800)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
    // Auto-send the suggestion
    setTimeout(() => {
      handleSendMessage(suggestion)
    }, 100)
  }

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputValue
    if (!messageToSend.trim() || isLoading) return

    const proactiveManager = getProactiveAssistanceManager()
    proactiveManager.recordFormInteraction()

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const applicationContext = (window as any).applicationContext || {}
      const enhancedContext = {
        currentPath: pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        applicationContext,
      }

      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      console.log("[v0] Sending chat request:", {
        message: messageToSend,
        context: enhancedContext,
        conversationHistory: conversationHistory.slice(-8),
      })

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          context: enhancedContext,
          conversationHistory: conversationHistory.slice(-8),
        }),
      })

      console.log("[v0] Chat API response status:", response.status)

      if (!response.ok) {
        console.error("[v0] Chat API error response:", response.status, response.statusText)
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Chat API response data:", data)

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          data.message ||
          "I received your message but couldn't generate a response. Please try rephrasing your question.",
        role: "assistant",
        timestamp: new Date(),
        action: data.action,
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (data.action?.type === "navigate") {
        setTimeout(() => {
          handleNavigation(
            data.action.destination,
            data.action.stepNumber,
            data.action.message,
            data.action.tabName,
            data.action.category,
            data.action.subtype,
            data.action.prefill,
            data.action.params,
          )
        }, 500)
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getPageContext = () => {
    if (pathname === "/") return "Homepage"
    if (pathname === "/about") return "About Page"
    if (pathname === "/account") return "Account Dashboard"
    if (pathname.includes("/application")) {
      const appContext = (window as any).applicationContext
      if (appContext?.stepTitle) {
        return `Step ${appContext.currentStep + 1}: ${appContext.stepTitle}`
      }
      return "Benefits Application"
    }
    return "Benefits Access"
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-primary hover:bg-primary/90 ${hasNewProactiveMessage ? "animate-pulse ring-4 ring-primary/30" : ""}`}
        size="icon"
        disabled={isNavigating}
      >
        {isNavigating ? (
          <Navigation className="h-6 w-6 sm:h-7 sm:w-7 animate-pulse" />
        ) : isOpen ? (
          <X className="h-6 w-6 sm:h-7 sm:w-7" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
            {hasNewProactiveMessage && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </>
        )}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-20 sm:bottom-24 right-2 left-2 sm:right-6 sm:left-auto sm:w-96 h-[70vh] sm:h-[500px] max-h-[600px] shadow-2xl z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 sm:p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Benefits Assistant</h3>
                <p className="text-sm sm:text-sm opacity-80">{isNavigating ? "Navigating..." : getPageContext()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contextualSuggestions.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="h-8 w-8 sm:h-9 sm:w-9 text-primary-foreground hover:bg-primary-foreground/20"
                  title="Show suggestions"
                >
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 sm:h-9 sm:w-9 text-primary-foreground hover:bg-primary-foreground/20"
                disabled={isNavigating}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {showSuggestions && contextualSuggestions.length > 0 && (
            <div className="border-b bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Quick Help</span>
              </div>
              <div className="grid gap-2">
                {contextualSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left text-sm p-2 rounded bg-white border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 sm:p-4 space-y-4 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div
                    className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${message.isProactive ? "bg-orange-500" : "bg-primary"}`}
                  >
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[75%] p-3 sm:p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : message.isProactive
                        ? "bg-orange-50 border border-orange-200"
                        : "bg-muted"
                  }`}
                >
                  <p className="text-sm sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                )}
              </div>
            ))}
            {(isLoading || isNavigating) && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <div className="bg-muted p-3 sm:p-4 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 sm:p-4 border-t bg-white">
            <div className="flex gap-3 items-end">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about benefits..."
                className="flex-1 min-h-[44px] sm:min-h-[40px] max-h-[120px] resize-none text-base sm:text-sm border-2 border-gray-200 focus:border-primary rounded-lg px-3 py-2"
                disabled={isLoading || isNavigating}
                rows={1}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading || isNavigating}
                size="icon"
                className="flex-shrink-0 h-11 w-11 sm:h-10 sm:w-10 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
