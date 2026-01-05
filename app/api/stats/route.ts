import type { NextRequest } from "next/server"
import { apiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { withMiddleware } from "@/lib/middleware"
import { db } from "@/lib/db"

async function handleGet(req: NextRequest) {
  try {
    const projects = Array.from(db.projects.values())
    const sessions = Array.from((db.chatSessions as Map<string, any>)?.values() || [])

    const stats = {
      totalProjects: projects.length,
      totalChats: sessions.length,
      totalDeployments: db.deployments?.size || 0,
      totalShares: db.shares?.size || 0,
      recentProjects: projects.slice(-5).reverse(),
      popularTemplates: [
        { name: "Landing Page", count: Math.floor(Math.random() * 100) },
        { name: "Portfolio", count: Math.floor(Math.random() * 100) },
        { name: "Dashboard", count: Math.floor(Math.random() * 100) },
        { name: "E-commerce", count: Math.floor(Math.random() * 100) },
      ],
      generationStats: {
        total: projects.reduce((sum, p) => sum + (p.versions?.length || 1), 0),
        successful: projects.length,
        avgTime: "12s",
      },
    }

    logger.info("Stats retrieved")
    return apiResponse.success(stats)
  } catch (error) {
    logger.error("Error getting stats", { error })
    return apiResponse.error("Failed to get stats")
  }
}

export const GET = withMiddleware(handleGet, { rateLimit: false })
