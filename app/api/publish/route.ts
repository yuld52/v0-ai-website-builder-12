import type { NextRequest } from "next/server"
import { z } from "zod"
import { ApiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { validateRequest } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const publishSchema = z.object({
      id: z.string().optional(),
      code: z.string().min(1, "Code is required"),
      title: z.string().optional(),
    })

    const validation = await validateRequest(request, publishSchema)
    if (!validation.success) {
      return ApiResponse.error(validation.error, 400, "VALIDATION_ERROR")
    }

    const { id, code, title } = validation.data

    const VERCEL_TOKEN = process.env.VERCEL_TOKEN
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

    if (!VERCEL_TOKEN) {
      const previewId = `preview-${id || Date.now()}`
      const previewUrl = `${request.nextUrl.origin}/preview/${previewId}`

      logger.warn("Publishing without Vercel token - using preview mode", { previewId })

      return ApiResponse.success({
        url: previewUrl,
        message: "Preview gerado localmente. Configure VERCEL_TOKEN para deploy real.",
        isPreview: true,
      })
    }

    const projectName = (title || `wexar-${id || Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .substring(0, 50)

    const files = extractFilesFromHTML(code)

    logger.info("Starting Vercel deployment", { projectName, fileCount: files.length })

    const deploymentResponse = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
        ...(VERCEL_TEAM_ID && { "X-Vercel-Team-Id": VERCEL_TEAM_ID }),
      },
      body: JSON.stringify({
        name: projectName,
        files,
        projectSettings: {
          framework: null,
          buildCommand: null,
          outputDirectory: null,
        },
        target: "production",
      }),
    })

    if (!deploymentResponse.ok) {
      const error = await deploymentResponse.json()
      logger.error("Vercel deployment failed", { error, projectName })
      return ApiResponse.error(
        error.error?.message || "Vercel deployment failed",
        deploymentResponse.status,
        "DEPLOYMENT_ERROR",
      )
    }

    const deployment = await deploymentResponse.json()
    const deploymentUrl = `https://${deployment.url}`

    logger.info("Deployment successful", { deploymentUrl, deploymentId: deployment.id })

    return ApiResponse.success({
      url: deploymentUrl,
      deploymentId: deployment.id,
      message: "Site publicado na Vercel com sucesso!",
      isPreview: false,
    })
  } catch (error) {
    logger.error("Error publishing site", { error })
    return ApiResponse.error(error instanceof Error ? error.message : "Failed to publish site", 500, "INTERNAL_ERROR")
  }
}

function extractFilesFromHTML(htmlCode: string): Array<{ file: string; data: string }> {
  const files: Array<{ file: string; data: string }> = []

  files.push({
    file: "index.html",
    data: htmlCode,
  })

  files.push({
    file: "package.json",
    data: JSON.stringify(
      {
        name: "wexar-generated-site",
        version: "1.0.0",
        private: true,
      },
      null,
      2,
    ),
  })

  files.push({
    file: "vercel.json",
    data: JSON.stringify(
      {
        routes: [
          {
            src: "/(.*)",
            dest: "/index.html",
          },
        ],
      },
      null,
      2,
    ),
  })

  return files
}
