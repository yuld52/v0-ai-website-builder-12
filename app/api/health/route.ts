import { ApiResponse } from "@/lib/api-response"
import { cache } from "@/lib/cache"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cache: {
        size: cache.size(),
      },
      logs: {
        total: logger.getLogs().length,
        errors: logger.getLogs("error").length,
      },
    }

    return ApiResponse.success(health)
  } catch (error) {
    return ApiResponse.error("Health check failed", 500)
  }
}
