import type { NextRequest } from "next/server"
import { ApiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db"
import { z } from "zod"
import { validateRequest } from "@/lib/validation"

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  isFavorite: z.boolean().optional(),
  status: z.enum(["active", "archived", "deleted"]).optional(),
  isPublic: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const project = db.getProject(id)

    if (!project) {
      return ApiResponse.error("Project not found", 404)
    }

    logger.info("Project retrieved", { projectId: id })
    return ApiResponse.success(project)
  } catch (error) {
    logger.error("Error getting project", { error })
    return ApiResponse.error("Failed to get project")
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const validation = await validateRequest(req, updateProjectSchema)
    if (!validation.success) {
      return ApiResponse.error(validation.error, 400, "VALIDATION_ERROR")
    }

    const existingProject = db.getProject(id)
    if (!existingProject) {
      return ApiResponse.error("Project not found", 404, "NOT_FOUND")
    }

    const updatedProject = db.updateProject(id, validation.data)

    if (!updatedProject) {
      return ApiResponse.error("Failed to update project", 500, "UPDATE_FAILED")
    }

    logger.info("Project updated successfully", { projectId: id })

    return ApiResponse.success(updatedProject)
  } catch (error) {
    logger.error("Error updating project", { error, projectId: params.id })
    return ApiResponse.error(error instanceof Error ? error.message : "Failed to update project", 500, "INTERNAL_ERROR")
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const deleted = db.deleteProject(id)

    if (!deleted) {
      return ApiResponse.error("Project not found", 404)
    }

    logger.info("Project deleted", { projectId: id })
    return ApiResponse.success({ deleted: true })
  } catch (error) {
    logger.error("Error deleting project", { error })
    return ApiResponse.error("Failed to delete project")
  }
}
