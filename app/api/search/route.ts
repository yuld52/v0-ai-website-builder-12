import type { NextRequest } from "next/server"
import { apiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { withMiddleware } from "@/lib/middleware"
import { db } from "@/lib/db"

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"

    if (!query || query.trim().length < 2) {
      return apiResponse.error("Search query must be at least 2 characters", 400)
    }

    const results: any[] = []

    // Search projects
    if (type === "all" || type === "projects") {
      const projects = Array.from(db.projects.values())
      const projectResults = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()),
      )
      results.push(...projectResults.map((p) => ({ ...p, type: "project" })))
    }

    // Search chat sessions
    if (type === "all" || type === "chats") {
      const sessions = Array.from((db.chatSessions as Map<string, any>).values())
      const chatResults = sessions.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.messages.some((m: any) => m.content.toLowerCase().includes(query.toLowerCase())),
      )
      results.push(...chatResults.map((c) => ({ ...c, type: "chat" })))
    }

    logger.info("Search completed", { query, type, resultsCount: results.length })
    return apiResponse.success({ results, query, count: results.length })
  } catch (error) {
    logger.error("Error searching", { error })
    return apiResponse.error("Failed to search")
  }
}

export const GET = withMiddleware(handleGet, { rateLimit: false })
