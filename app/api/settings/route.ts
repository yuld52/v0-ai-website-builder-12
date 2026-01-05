import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { apiResponse, apiError } from "@/lib/api-response"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user"
    const settings = db.getUserSettings(userId)

    return apiResponse({ settings })
  } catch (error) {
    logger.error("Error fetching settings", error)
    return apiError("Failed to fetch settings")
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user"
    const updates = await req.json()

    const settings = db.updateUserSettings(userId, updates)

    logger.info("Settings updated", { userId })
    return apiResponse({ settings })
  } catch (error) {
    logger.error("Error updating settings", error)
    return apiError("Failed to update settings")
  }
}
