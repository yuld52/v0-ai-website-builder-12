import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { apiResponse, apiError } from "@/lib/api-response"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    // Mock user ID (in production, get from auth token)
    const userId = req.headers.get("x-user-id") || "demo-user"

    let user = db.getUser(userId)

    if (!user) {
      // Create demo user
      user = db.createUser({
        email: "user@wexar.ai",
        name: "Demo User",
        plan: "free",
        tokensRemaining: 100,
      })
    }

    logger.info("User fetched", { userId: user.id })
    return apiResponse({ user })
  } catch (error) {
    logger.error("Error fetching user", error)
    return apiError("Failed to fetch user")
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user"
    const updates = await req.json()

    const user = db.updateUser(userId, updates)

    if (!user) {
      return apiError("User not found", 404)
    }

    logger.info("User updated", { userId })
    return apiResponse({ user })
  } catch (error) {
    logger.error("Error updating user", error)
    return apiError("Failed to update user")
  }
}
