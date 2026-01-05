import type { User, Project, ChatSession, FileUpload, UserSettings, Template, Message } from "./types"
import { logger } from "./logger"

// In-memory database (replace with real DB later)
class Database {
  private users: Map<string, User> = new Map()
  private projects: Map<string, Project> = new Map()
  private chatSessions: Map<string, ChatSession> = new Map()
  private fileUploads: Map<string, FileUpload> = new Map()
  private userSettings: Map<string, UserSettings> = new Map()
  private templates: Template[] = []

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: "landing-1",
        name: "Modern Landing Page",
        description: "Clean and modern landing page with hero section",
        category: "landing",
        thumbnail: "/templates/landing-1.png",
        prompt: "Criar uma landing page moderna com seção hero, features, pricing e footer",
        tags: ["landing", "modern", "business"],
        complexity: "beginner",
        popularity: 150,
      },
      {
        id: "dashboard-1",
        name: "Analytics Dashboard",
        description: "Full-featured analytics dashboard with charts",
        category: "dashboard",
        thumbnail: "/templates/dashboard-1.png",
        prompt: "Criar um dashboard de analytics com gráficos, métricas e tabelas de dados",
        tags: ["dashboard", "analytics", "charts"],
        complexity: "advanced",
        popularity: 120,
      },
      {
        id: "ecommerce-1",
        name: "E-commerce Store",
        description: "Product listing and shopping cart",
        category: "ecommerce",
        thumbnail: "/templates/ecommerce-1.png",
        prompt: "Criar uma loja e-commerce com listagem de produtos, carrinho e checkout",
        tags: ["ecommerce", "shop", "products"],
        complexity: "intermediate",
        popularity: 200,
      },
    ]
  }

  // User operations
  createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): User {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(user.id, user)
    return user
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId)
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const user = this.users.get(userId)
    if (!user) return null
    const updatedUser = { ...user, ...updates, updatedAt: new Date() }
    this.users.set(userId, updatedUser)
    return updatedUser
  }

  // Project operations
  createProject(projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "views" | "likes">): Project {
    const project: Project = {
      ...projectData,
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      views: 0,
      likes: 0,
      title: projectData.title || projectData.name,
      editCount: projectData.editCount || 0,
      framework: projectData.framework || "react",
      status: projectData.status || "active",
      isPublic: projectData.isPublic || false,
      versions: projectData.versions || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.projects.set(project.id, project)
    return project
  }

  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId)
  }

  getUserProjects(userId: string, filters?: { status?: string; favorite?: boolean }): Project[] {
    let projects = Array.from(this.projects.values()).filter((p) => p.userId === userId)

    if (filters?.status) {
      projects = projects.filter((p) => p.status === filters.status)
    }
    if (filters?.favorite !== undefined) {
      projects = projects.filter((p) => p.isFavorite === filters.favorite)
    }

    return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  updateProject(projectId: string, updates: Partial<Project>): Project | null {
    const project = this.projects.get(projectId)
    if (!project) return null

    if (updates.name && updates.name.trim().length === 0) {
      throw new Error("Project name cannot be empty")
    }

    if (updates.code && updates.code !== project.code) {
      const versions = project.versions || []
      versions.unshift({
        id: `v${versions.length + 1}_${Date.now()}`,
        code: project.code,
        timestamp: new Date().toISOString(),
        description: updates.description || "Auto-saved version",
      })

      if (versions.length > 20) {
        versions.splice(20)
      }

      updates.versions = versions
      updates.editCount = (project.editCount || 0) + 1
    }

    const updatedProject = { ...project, ...updates, updatedAt: new Date() }
    this.projects.set(projectId, updatedProject)

    logger.info("Project updated", { projectId, changes: Object.keys(updates) })

    return updatedProject
  }

  deleteProject(projectId: string): boolean {
    return this.projects.delete(projectId)
  }

  searchProjects(userId: string, query: string): Project[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.projects.values())
      .filter(
        (p) =>
          p.userId === userId &&
          (p.name.toLowerCase().includes(lowerQuery) ||
            p.title.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery)),
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  // Chat operations
  createChatSession(userId: string, title: string, projectId?: string): ChatSession {
    const session: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      title,
      messages: [],
      context: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: new Date(),
    }
    this.chatSessions.set(session.id, session)
    return session
  }

  getChatSession(sessionId: string): ChatSession | undefined {
    return this.chatSessions.get(sessionId)
  }

  getUserChatSessions(userId: string, limit = 50): ChatSession[] {
    return Array.from(this.chatSessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
      .slice(0, limit)
  }

  addMessageToChat(sessionId: string, message: Omit<Message, "id" | "timestamp">): ChatSession | null {
    const session = this.chatSessions.get(sessionId)
    if (!session) return null

    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    session.messages.push(newMessage)
    session.lastMessageAt = new Date()
    session.updatedAt = new Date()
    this.chatSessions.set(sessionId, session)
    return session
  }

  // File operations
  saveFileUpload(fileData: Omit<FileUpload, "id" | "uploadedAt">): FileUpload {
    const file: FileUpload = {
      ...fileData,
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date(),
    }
    this.fileUploads.set(file.id, file)
    return file
  }

  getFileUpload(fileId: string): FileUpload | undefined {
    return this.fileUploads.get(fileId)
  }

  getUserFiles(userId: string): FileUpload[] {
    return Array.from(this.fileUploads.values())
      .filter((f) => f.userId === userId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
  }

  // Settings operations
  getUserSettings(userId: string): UserSettings {
    const existing = this.userSettings.get(userId)
    if (existing) return existing

    const defaultSettings: UserSettings = {
      userId,
      theme: "dark",
      defaultModel: "deepseek/deepseek-chat",
      autoSave: true,
      notifications: {
        email: true,
        push: false,
        updates: true,
      },
      preferences: {
        codeStyle: "modern",
        framework: "react",
        language: "pt-BR",
      },
      updatedAt: new Date(),
    }
    this.userSettings.set(userId, defaultSettings)
    return defaultSettings
  }

  updateUserSettings(userId: string, updates: Partial<UserSettings>): UserSettings {
    const current = this.getUserSettings(userId)
    const updated = { ...current, ...updates, updatedAt: new Date() }
    this.userSettings.set(userId, updated)
    return updated
  }

  // Template operations
  getTemplates(category?: string): Template[] {
    if (category) {
      return this.templates.filter((t) => t.category === category)
    }
    return this.templates.sort((a, b) => b.popularity - a.popularity)
  }

  getTemplate(templateId: string): Template | undefined {
    return this.templates.find((t) => t.id === templateId)
  }

  searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase()
    return this.templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  async executeTransaction<T>(
    operation: () => Promise<T> | T,
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const result = await Promise.resolve(operation())
      return { success: true, data: result }
    } catch (error) {
      logger.error("Transaction failed", { error })
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      }
    }
  }

  searchProjects(userId: string, query: string): Project[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.projects.values())
      .filter(
        (p) =>
          p.userId === userId &&
          (p.name.toLowerCase().includes(lowerQuery) ||
            p.title.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery)),
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  cleanupOldData(daysOld = 30): { deletedProjects: number; deletedChats: number } {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    let deletedProjects = 0
    let deletedChats = 0

    // Limpar projetos antigos não favoritos
    for (const [id, project] of this.projects.entries()) {
      if (!project.isFavorite && project.updatedAt < cutoffDate) {
        this.projects.delete(id)
        deletedProjects++
      }
    }

    // Limpar sessões de chat antigas
    for (const [id, session] of this.chatSessions.entries()) {
      if (session.lastMessageAt < cutoffDate) {
        this.chatSessions.delete(id)
        deletedChats++
      }
    }

    logger.info("Cleanup completed", { deletedProjects, deletedChats })

    return { deletedProjects, deletedChats }
  }
}

export const db = new Database()
