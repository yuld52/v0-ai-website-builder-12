"use client"

import { useState } from "react"

export interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)

  const createSession = async (title: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      const data = await response.json()
      setSessions((prev) => [data.data, ...prev])
      setCurrentSession(data.data)
      return data.data
    } catch (err) {
      console.error("Error creating session:", err)
      throw err
    }
  }

  const sendMessage = async (sessionId: string, content: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chat/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Update current session with new messages
      if (currentSession?.id === sessionId) {
        setCurrentSession((prev) => (prev ? { ...prev, messages: data.data } : null))
      }

      return data.data
    } catch (err) {
      console.error("Error sending message:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/chat")

      if (!response.ok) {
        throw new Error("Failed to load sessions")
      }

      const data = await response.json()
      setSessions(data.data || [])
    } catch (err) {
      console.error("Error loading sessions:", err)
    }
  }

  return {
    sessions,
    currentSession,
    loading,
    createSession,
    sendMessage,
    loadSessions,
    setCurrentSession,
  }
}
