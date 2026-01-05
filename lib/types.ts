export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: "free" | "pro" | "enterprise"
  tokensRemaining: number
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  userId: string
  name: string
  title?: string
  description: string
  code: string
  html?: string
  css?: string
  js?: string
  framework?: "react" | "html" | "vue" | "svelte"
  status: "draft" | "published" | "archived" | "active"
  url?: string
  thumbnail?: string
  isFavorite: boolean
  isPublic?: boolean
  editCount?: number
  views: number
  likes: number
  tags: string[]
  versions?: any[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  messages?: Message[]
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    tokensUsed?: number
    error?: string
  }
}

export interface ChatSession {
  id: string
  userId: string
  projectId?: string
  title: string
  messages: Message[]
  context: string[]
  createdAt: Date
  updatedAt: Date
  lastMessageAt: Date
}

export interface FileUpload {
  id: string
  userId: string
  projectId?: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: Date
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  prompt: string
  tags: string[]
  complexity: "beginner" | "intermediate" | "advanced"
  popularity: number
}

export interface UserSettings {
  userId: string
  theme: "dark" | "light" | "system"
  defaultModel: string
  autoSave: boolean
  notifications: {
    email: boolean
    push: boolean
    updates: boolean
  }
  preferences: {
    codeStyle: string
    framework: string
    language: string
  }
  updatedAt: Date
}
