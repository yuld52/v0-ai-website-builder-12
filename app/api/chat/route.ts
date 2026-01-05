import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { apiResponse, apiError } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { validateRequest } from "@/lib/validation"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user"
    const sessions = db.getUserChatSessions(userId)

    return apiResponse({ sessions })
  } catch (error) {
    logger.error("Error fetching chat sessions", error)
    return apiError("Failed to fetch chat sessions")
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user"
    const body = await req.json()

    const validation = validateRequest(body, ["title"])
    if (!validation.valid) {
      return apiError(validation.error!, 400)
    }

    const session = db.createChatSession(userId, body.title, body.projectId)

    logger.info("Chat session created", { sessionId: session.id, userId })
    return apiResponse({ session }, 201)
  } catch (error) {
    logger.error("Error creating chat session", error)
    return apiError("Failed to create chat session")
  }
}
