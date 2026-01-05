import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "./rate-limiter"
import { logger } from "./logger"
import { ApiResponse } from "./api-response"

export function withMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: boolean
    auth?: boolean
    cors?: boolean
  } = {},
) {
  return async (req: NextRequest) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // CORS handling
      if (options.cors !== false) {
        const origin = req.headers.get("origin") || ""
        const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"]

        if (req.method === "OPTIONS") {
          return new NextResponse(null, {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
              "Access-Control-Max-Age": "86400",
            },
          })
        }
      }

      // Rate limiting
      if (options.rateLimit !== false) {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
        const userId = req.headers.get("x-user-id") || undefined

        const rateLimitResult = rateLimit(ip, userId)

        if (!rateLimitResult.allowed) {
          logger.warn(
            "Rate limit exceeded",
            { ip, userId, url: req.url },
            {
              context: { requestId, ip, userId, url: req.url },
            },
          )
          return ApiResponse.tooManyRequests(
            "Too many requests",
            Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
          )
        }
      }

      // Authentication (if enabled)
      if (options.auth) {
        const authHeader = req.headers.get("authorization")
        const token = authHeader?.replace("Bearer ", "")

        if (!token) {
          return ApiResponse.unauthorized("Authentication required")
        }

        // import jwt from 'jsonwebtoken'
        // try {
        //   const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        //   req.userId = decoded.userId
        // } catch {
        //   return ApiResponse.unauthorized("Invalid token")
        // }
      }

      const response = await handler(req)
      response.headers.set("X-Request-Id", requestId)

      // Add CORS headers to response
      if (options.cors !== false) {
        const origin = req.headers.get("origin") || ""
        const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"]

        response.headers.set(
          "Access-Control-Allow-Origin",
          allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*",
        )
      }

      return response
    } catch (error) {
      logger.error(
        "Middleware error",
        { error, url: req.url },
        {
          context: { requestId, url: req.url },
        },
      )
      return ApiResponse.error("Internal server error", 500)
    }
  }
}
