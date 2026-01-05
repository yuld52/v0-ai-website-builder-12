import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { apiResponse, apiError } from "@/lib/api-response"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user"
    const formData = await req.formData()
    const file = formData.get("file") as File

    console.log("[v0] File upload started:", { fileName: file?.name, size: file?.size, userId })

    if (!file) {
      console.log("[v0] No file provided")
      return apiError("No file provided", 400)
    }

    try {
      const mockUrl = `/uploads/${Date.now()}_${file.name}`

      const fileRecord = db.saveFileUpload({
        userId,
        projectId: formData.get("projectId") as string | undefined,
        filename: `${Date.now()}_${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: mockUrl,
      })

      console.log("[v0] File saved to database:", { fileId: fileRecord.id, fileName: file.name })
      logger.info("File uploaded", { fileId: fileRecord.id, userId, size: file.size })

      return apiResponse.created({ file: fileRecord })
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      throw dbError
    }
  } catch (error) {
    console.error("[v0] Upload error:", error instanceof Error ? error.message : String(error))
    logger.error("Error uploading file", error)
    return apiError("Failed to upload file", 500, error instanceof Error ? error.message : undefined)
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user"
    const files = db.getUserFiles(userId)

    return apiResponse.success({ files })
  } catch (error) {
    logger.error("Error fetching files", error)
    return apiError("Failed to fetch files")
  }
}
