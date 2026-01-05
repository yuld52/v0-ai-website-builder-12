// Simple in-memory cache with TTL
interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class Cache {
  private store = new Map<string, CacheEntry<any>>()
  private readonly defaultTTL = 300000 // 5 minutes

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)

    if (!entry) return null

    if (entry.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }

    return entry.value as T
  }

  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false

    if (entry.expiresAt < Date.now()) {
      this.store.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key)
      }
    }
  }

  size(): number {
    return this.store.size
  }
}

export const cache = new Cache()

// Cleanup expired entries every minute
setInterval(() => cache.cleanup(), 60000)
