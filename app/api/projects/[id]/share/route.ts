import type { NextRequest } from "next/server"
import { apiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { withMiddleware } from "@/lib/middleware"
import { db } from "@/lib/db"

async function handlePost(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const project = db.projects.get(id)

    if (!project) {
      return apiResponse.error("Project not found", 404)
    }

    const body = await req.json()
    const { visibility = "public", expiresIn } = body

    // Generate share token
    const shareToken = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${shareToken}`

    const shareData = {
      token: shareToken,
      projectId: id,
      visibility,
      url: shareUrl,
      createdAt: new Date().toISOString(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
      views: 0,
    }

    // Store share data
    if (!db.shares) {
      db.shares = new Map()
    }
    db.shares.set(shareToken, shareData)

    // Update project with share info
    const updatedProject = {
      ...project,
      shareToken,
      shareUrl,
      updatedAt: new Date().toISOString(),
    }
    db.projects.update(id, updatedProject)

    logger.info("Project shared", { projectId: id, shareToken, visibility })
    return apiResponse.success(shareData)
  } catch (error) {
    logger.error("Error sharing project", { error })
    return apiResponse.error("Failed to share project")
  }
}

export const POST = withMiddleware(handlePost)
