import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { apiResponse, apiError } from "@/lib/api-response"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId
    const body = await req.json()

    const session = db.getChatSession(sessionId)
    if (!session) {
      return apiError("Chat session not found", 404)
    }

    const updatedSession = db.addMessageToChat(sessionId, {
      role: body.role,
      content: body.content,
      metadata: body.metadata,
    })

    logger.info("Message added to chat", { sessionId, messageCount: updatedSession?.messages.length })
    return apiResponse({ session: updatedSession })
  } catch (error) {
    logger.error("Error adding message", error)
    return apiError("Failed to add message")
  }
}
