export class ApiResponse {
  static success<T>(data: T, message?: string, status = 200) {
    return Response.json(
      {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
      },
      {
        status,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }

  static error(message: string, status = 500, details?: any, code?: string) {
    return Response.json(
      {
        success: false,
        error: {
          message,
          code: code || `ERR_${status}`,
          details,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }

  static created<T>(data: T, message?: string) {
    return this.success(data, message, 201)
  }

  static noContent() {
    return new Response(null, { status: 204 })
  }

  static notFound(message = "Resource not found") {
    return this.error(message, 404, undefined, "NOT_FOUND")
  }

  static unauthorized(message = "Authentication required") {
    return this.error(message, 401, undefined, "UNAUTHORIZED")
  }

  static forbidden(message = "Access denied") {
    return this.error(message, 403, undefined, "FORBIDDEN")
  }

  static badRequest(message: string, details?: any) {
    return this.error(message, 400, details, "BAD_REQUEST")
  }

  static tooManyRequests(message = "Too many requests", retryAfter?: number) {
    const response = this.error(message, 429, { retryAfter }, "RATE_LIMIT_EXCEEDED")
    if (retryAfter) {
      response.headers.set("Retry-After", retryAfter.toString())
    }
    return response
  }
}

export const apiError = (message: string, status = 500, details?: any) => ApiResponse.error(message, status, details)

export const apiResponse = {
  success: ApiResponse.success,
  created: ApiResponse.created,
  error: apiError,
}
