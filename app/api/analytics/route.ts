import type { NextRequest } from "next/server"
import { apiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { withMiddleware } from "@/lib/middleware"

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, properties } = body

    // Log analytics event
    logger.info("Analytics event", { event, properties })

    // In a real implementation, send to analytics service (Mixpanel, Amplitude, etc.)

    return apiResponse.success({ tracked: true })
  } catch (error) {
    logger.error("Error tracking analytics", { error })
    return apiResponse.error("Failed to track event")
  }
}

export const POST = withMiddleware(handlePost, { rateLimit: false })
