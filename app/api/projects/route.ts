import type { NextRequest } from "next/server"
import { ApiResponse } from "@/lib/api-response"
import { generateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/logger"
import { validateData, schemas } from "@/lib/validation"
import { db } from "@/lib/db"

// In-memory project storage (replace with database in production)
const projects = new Map<string, any>()

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "default"
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const rateLimit = generateLimiter.check(ip, userId)

    if (!rateLimit.allowed) {
      return ApiResponse.tooManyRequests("Too many requests", Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status") || undefined
    const favorite = searchParams.get("favorite") === "true" ? true : undefined

    const userProjects = db.getUserProjects(userId, { status, favorite })

    const paginatedProjects = userProjects.slice(offset, offset + limit)

    logger.info(`Retrieved ${paginatedProjects.length} projects`, { userId, total: userProjects.length })

    return ApiResponse.success({
      data: paginatedProjects,
      pagination: {
        total: userProjects.length,
        limit,
        offset,
        hasMore: offset + limit < userProjects.length,
      },
    })
  } catch (error) {
    logger.error("Error fetching projects", { error })
    return ApiResponse.error("Failed to fetch projects", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "default"
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    const rateLimit = generateLimiter.check(ip, userId)
    if (!rateLimit.allowed) {
      return ApiResponse.tooManyRequests("Too many requests")
    }

    const body = await request.json()

    const validation = validateData(schemas.projectCreate, { ...body, userId })
    if (!validation.success) {
      return ApiResponse.badRequest(validation.error.message, validation.error.details)
    }

    const project = db.createProject(validation.data)

    logger.info(`Created project ${project.id}`, { name: project.name, userId })

    return ApiResponse.created(project, "Project created successfully")
  } catch (error) {
    logger.error("Error creating project", { error })
    return ApiResponse.error("Failed to create project", 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, code, isFavorite, tags } = body

    const project = projects.get(id)

    if (!project) {
      return ApiResponse.error("Project not found", 404)
    }

    // Update fields
    if (title !== undefined) {
      project.title = title
    }

    if (description !== undefined) {
      project.description = description
    }

    if (code !== undefined) {
      // Save version before updating
      project.versions.unshift({
        id: `v${project.versions.length + 1}_${Date.now()}`,
        code: project.code,
        timestamp: new Date().toISOString(),
        description: "Auto-saved version",
      })

      // Keep only last 10 versions
      if (project.versions.length > 10) {
        project.versions = project.versions.slice(0, 10)
      }

      project.code = code
      project.editCount++
    }

    if (isFavorite !== undefined) {
      project.isFavorite = isFavorite
    }

    if (tags !== undefined) {
      project.tags = tags
    }

    project.updatedAt = new Date().toISOString()

    logger.info(`Updated project ${id}`)

    return ApiResponse.success(project, "Project updated successfully")
  } catch (error) {
    logger.error("Error updating project", { error })
    return ApiResponse.error("Failed to update project")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return ApiResponse.error("Project ID is required", 400)
    }

    const deleted = projects.delete(id)

    if (!deleted) {
      return ApiResponse.error("Project not found", 404)
    }

    logger.info(`Deleted project ${id}`)

    return ApiResponse.noContent()
  } catch (error) {
    logger.error("Error deleting project", { error })
    return ApiResponse.error("Failed to delete project")
  }
}
