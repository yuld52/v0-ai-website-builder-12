interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  maxRequestsAuthenticated?: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private readonly config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    setInterval(() => this.cleanup(), 60000)
  }

  check(
    identifier: string,
    userId?: string,
  ): {
    allowed: boolean
    remaining: number
    resetAt: number
  } {
    const now = Date.now()

    const key = userId ? `${userId}:${identifier}` : identifier

    const maxRequests =
      userId && this.config.maxRequestsAuthenticated ? this.config.maxRequestsAuthenticated : this.config.maxRequests

    const entry = this.limits.get(key)

    if (!entry || entry.resetAt < now) {
      const resetAt = now + this.config.windowMs
      this.limits.set(key, { count: 1, resetAt })
      return { allowed: true, remaining: maxRequests - 1, resetAt }
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    entry.count++
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
  }

  reset(identifier: string) {
    this.limits.delete(identifier)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetAt < now) {
        this.limits.delete(key)
      }
    }
  }

  getStats() {
    return {
      totalEntries: this.limits.size,
      config: this.config,
    }
  }
}

export { RateLimiter }

export const apiLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 30,
  maxRequestsAuthenticated: 100,
})

export const generateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 5,
  maxRequestsAuthenticated: 15,
})

export const authLimiter = new RateLimiter({
  windowMs: 300000,
  maxRequests: 5,
})

export const rateLimiter = apiLimiter
export const rateLimit = (identifier: string, userId?: string) => apiLimiter.check(identifier, userId)
