import type { NextRequest } from "next/server"
import { apiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    logger.info("Webhook received", { type, data })

    // Handle different webhook types
    switch (type) {
      case "deployment.success":
        // Handle deployment success
        break
      case "deployment.failed":
        // Handle deployment failure
        break
      case "project.updated":
        // Handle project update
        break
      default:
        logger.warn("Unknown webhook type", { type })
    }

    return apiResponse.success({ received: true })
  } catch (error) {
    logger.error("Error processing webhook", { error })
    return apiResponse.error("Failed to process webhook")
  }
}
