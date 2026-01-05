import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { apiResponse, apiError } from "@/lib/api-response"
import { cache } from "@/lib/cache"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const cacheKey = `templates:${category || "all"}:${search || ""}`
    const cached = cache.get(cacheKey)
    if (cached) {
      return apiResponse({ templates: cached, cached: true })
    }

    let templates
    if (search) {
      templates = db.searchTemplates(search)
    } else {
      templates = db.getTemplates(category || undefined)
    }

    cache.set(cacheKey, templates, 300) // Cache for 5 minutes
    return apiResponse({ templates })
  } catch (error) {
    return apiError("Failed to fetch templates")
  }
}
