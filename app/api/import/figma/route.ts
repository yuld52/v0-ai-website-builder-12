import type { NextRequest } from "next/server"
import { apiResponse, apiError } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { rateLimiter } from "@/lib/rate-limiter"

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "demo-user"

  if (!rateLimiter.checkLimit(`figma:${userId}`)) {
    return apiError("Rate limit exceeded. Please try again later.", 429)
  }

  try {
    const { figmaUrl } = await req.json()

    if (!figmaUrl || !figmaUrl.includes("figma.com")) {
      return apiError("Invalid Figma URL", 400)
    }

    // Extract file ID from Figma URL
    const fileIdMatch = figmaUrl.match(/file\/([a-zA-Z0-9]+)/)
    if (!fileIdMatch) {
      return apiError("Could not extract Figma file ID", 400)
    }

    const fileId = fileIdMatch[1]

    // In production, use Figma API to fetch design data
    // const figmaData = await fetchFigmaDesign(fileId)
    // const generatedCode = await convertFigmaToCode(figmaData)

    logger.info("Figma import requested", { userId, fileId })

    // Mock response for now
    return apiResponse({
      success: true,
      message: "Figma design imported successfully",
      fileId,
      prompt: `Criar um site baseado no design do Figma: ${figmaUrl}`,
    })
  } catch (error) {
    logger.error("Error importing from Figma", error)
    return apiError("Failed to import from Figma")
  }
}
