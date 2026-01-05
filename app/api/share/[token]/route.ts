import type { NextRequest } from "next/server"
import { apiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params

    if (!db.shares) {
      return apiResponse.error("Share not found", 404)
    }

    const share = db.shares.get(token)

    if (!share) {
      return apiResponse.error("Share not found", 404)
    }

    // Check if expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return apiResponse.error("Share link has expired", 410)
    }

    // Get project
    const project = db.projects.get(share.projectId)

    if (!project) {
      return apiResponse.error("Project not found", 404)
    }

    // Increment view count
    share.views += 1
    db.shares.set(token, share)

    logger.info("Shared project accessed", { token, projectId: share.projectId, views: share.views })

    return apiResponse.success({
      project: {
        name: project.name,
        description: project.description,
        code: project.code,
        createdAt: project.createdAt,
      },
      share: {
        views: share.views,
        createdAt: share.createdAt,
      },
    })
  } catch (error) {
    logger.error("Error accessing shared project", { error })
    return apiResponse.error("Failed to access shared project")
  }
}
