import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  contextData?: any
  navigationAction?: any
}

export interface ChatSession {
  sessionId: string
  messages: ChatMessage[]
  lastActivity: Date
}

export async function saveChatMessage(
  userId: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  contextData?: any,
  navigationAction?: any,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: userId,
      session_id: sessionId,
      message_role: role,
      message_content: content,
      context_data: contextData,
      navigation_action: navigationAction,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving chat message:", error)
    throw error
  }

  return data
}

export async function getChatHistory(userId: string, sessionId: string, limit = 20): Promise<ChatMessage[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("message_timestamp", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching chat history:", error)
    throw error
  }

  return data.map((row) => ({
    id: row.id,
    role: row.message_role as "user" | "assistant",
    content: row.message_content,
    timestamp: new Date(row.message_timestamp),
    contextData: row.context_data,
    navigationAction: row.navigation_action,
  }))
}

export async function getRecentChatSessions(userId: string, limit = 5): Promise<ChatSession[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("session_id, message_timestamp")
    .eq("user_id", userId)
    .order("message_timestamp", { ascending: false })
    .limit(100) // Get more to group by session

  if (error) {
    console.error("Error fetching recent sessions:", error)
    throw error
  }

  // Group by session and get the most recent sessions
  const sessionMap = new Map<string, Date>()
  data.forEach((row) => {
    const sessionId = row.session_id
    const timestamp = new Date(row.message_timestamp)
    if (!sessionMap.has(sessionId) || sessionMap.get(sessionId)! < timestamp) {
      sessionMap.set(sessionId, timestamp)
    }
  })

  // Sort sessions by last activity and take the most recent ones
  const recentSessions = Array.from(sessionMap.entries())
    .sort(([, a], [, b]) => b.getTime() - a.getTime())
    .slice(0, limit)

  // Fetch messages for each recent session
  const sessions: ChatSession[] = []
  for (const [sessionId, lastActivity] of recentSessions) {
    const messages = await getChatHistory(userId, sessionId, 10) // Get last 10 messages per session
    sessions.push({
      sessionId,
      messages,
      lastActivity,
    })
  }

  return sessions
}

export async function saveChatMessageClient(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  contextData?: any,
  navigationAction?: any,
) {
  const supabase = createBrowserClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: user.id,
      session_id: sessionId,
      message_role: role,
      message_content: content,
      context_data: contextData,
      navigation_action: navigationAction,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving chat message:", error)
    throw error
  }

  return data
}

export async function getChatHistoryClient(sessionId: string, limit = 20): Promise<ChatMessage[]> {
  const supabase = createBrowserClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return [] // Return empty array if not authenticated
  }

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", user.id)
    .eq("session_id", sessionId)
    .order("message_timestamp", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching chat history:", error)
    return []
  }

  return data.map((row) => ({
    id: row.id,
    role: row.message_role as "user" | "assistant",
    content: row.message_content,
    timestamp: new Date(row.message_timestamp),
    contextData: row.context_data,
    navigationAction: row.navigation_action,
  }))
}

export function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return generateSessionId()

  const stored = localStorage.getItem("chat_session_id")
  if (stored) return stored

  const newSessionId = generateSessionId()
  localStorage.setItem("chat_session_id", newSessionId)
  return newSessionId
}

export function clearCurrentSession(): string {
  if (typeof window !== "undefined") {
    localStorage.removeItem("chat_session_id")
  }
  return getOrCreateSessionId()
}
