import type { NextRequest } from "next/server"
import { apiResponse } from "@/lib/api-response"
import { logger } from "@/lib/logger"
import { withMiddleware } from "@/lib/middleware"
import { db } from "@/lib/db"

async function handleGet(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!db.deployments) {
      return apiResponse.error("Deployment not found", 404)
    }

    const deployment = db.deployments.get(id)

    if (!deployment) {
      return apiResponse.error("Deployment not found", 404)
    }

    logger.info("Deployment status retrieved", { deploymentId: id })
    return apiResponse.success(deployment)
  } catch (error) {
    logger.error("Error getting deployment", { error })
    return apiResponse.error("Failed to get deployment")
  }
}

export const GET = withMiddleware(handleGet)
