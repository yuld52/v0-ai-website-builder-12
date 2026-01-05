import type { NextRequest } from "next/server"
import { apiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { withMiddleware } from "@/lib/middleware"
import { db } from "@/lib/db"

async function handleGet(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const project = db.projects.get(id)

    if (!project) {
      return apiResponse.error("Project not found", 404)
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "zip"

    if (format === "zip") {
      // In a real implementation, create a zip file with all project files
      const exportData = {
        project,
        files: [
          { name: "index.html", content: project.code },
          { name: "README.md", content: `# ${project.name}\n\n${project.description || "AI Generated Website"}` },
        ],
      }

      logger.info("Project exported", { projectId: id, format })
      return apiResponse.success(exportData)
    }

    if (format === "github") {
      // Return data formatted for GitHub upload
      const githubData = {
        repository: project.name.toLowerCase().replace(/\s+/g, "-"),
        files: [
          { path: "index.html", content: project.code },
          { path: "README.md", content: `# ${project.name}\n\nGenerated with Wexar AI` },
        ],
      }

      logger.info("Project prepared for GitHub", { projectId: id })
      return apiResponse.success(githubData)
    }

    return apiResponse.error("Invalid export format", 400)
  } catch (error) {
    logger.error("Error exporting project", { error })
    return apiResponse.error("Failed to export project")
  }
}

export const GET = withMiddleware(handleGet)
