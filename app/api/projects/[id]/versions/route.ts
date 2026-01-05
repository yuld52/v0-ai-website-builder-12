import type { NextRequest } from "next/server"
import { ApiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"

// In-memory storage (shared with projects route)
const projects = new Map<string, any>()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const project = projects.get(projectId)

    if (!project) {
      return ApiResponse.error("Project not found", 404)
    }

    return ApiResponse.success({
      versions: project.versions || [],
      total: project.versions?.length || 0,
    })
  } catch (error) {
    logger.error("Error fetching versions", error)
    return ApiResponse.error("Failed to fetch versions")
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const project = projects.get(projectId)

    if (!project) {
      return ApiResponse.error("Project not found", 404)
    }

    const body = await request.json()
    const { versionId, description } = body

    if (!versionId) {
      // Create new version
      const version = {
        id: `v${(project.versions?.length || 0) + 1}_${Date.now()}`,
        code: project.code,
        timestamp: new Date().toISOString(),
        description: description || "Manual save",
      }

      if (!project.versions) project.versions = []
      project.versions.unshift(version)

      // Keep only last 10 versions
      if (project.versions.length > 10) {
        project.versions = project.versions.slice(0, 10)
      }

      logger.info(`Created version ${version.id} for project ${projectId}`)

      return ApiResponse.created(version, "Version created successfully")
    } else {
      // Restore version
      const version = project.versions?.find((v: any) => v.id === versionId)

      if (!version) {
        return ApiResponse.error("Version not found", 404)
      }

      project.code = version.code
      project.editCount++
      project.updatedAt = new Date().toISOString()

      logger.info(`Restored version ${versionId} for project ${projectId}`)

      return ApiResponse.success(project, "Version restored successfully")
    }
  } catch (error) {
    logger.error("Error managing version", error)
    return ApiResponse.error("Failed to manage version")
  }
}
