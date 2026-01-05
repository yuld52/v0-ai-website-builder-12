type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  context?: {
    requestId?: string
    userId?: string
    ip?: string
    url?: string
  }
}

interface LogOptions {
  context?: LogEntry["context"]
  persist?: boolean
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 5000 // Aumentado para 5000
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info"
  private levelPriority = { debug: 0, info: 1, warn: 2, error: 3 }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.logLevel]
  }

  private log(level: LogLevel, message: string, data?: any, options?: LogOptions) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context: options?.context,
    }

    if (options?.persist !== false) {
      this.logs.push(entry)
      if (this.logs.length > this.maxLogs) {
        this.logs.shift()
      }
    }

    const contextStr = entry.context
      ? `[${Object.entries(entry.context)
          .map(([k, v]) => `${k}:${v}`)
          .join(" ")}]`
      : ""

    const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log"
    const prefix = `[${level.toUpperCase()}] ${entry.timestamp} ${contextStr}`

    if (data) {
      console[consoleMethod](prefix, message, data)
    } else {
      console[consoleMethod](prefix, message)
    }
  }

  info(message: string, data?: any, options?: LogOptions) {
    this.log("info", message, data, options)
  }

  warn(message: string, data?: any, options?: LogOptions) {
    this.log("warn", message, data, options)
  }

  error(message: string, data?: any, options?: LogOptions) {
    this.log("error", message, data, options)
  }

  debug(message: string, data?: any, options?: LogOptions) {
    this.log("debug", message, data, options)
  }

  withContext(context: LogEntry["context"]) {
    return {
      info: (message: string, data?: any) => this.info(message, data, { context }),
      warn: (message: string, data?: any) => this.warn(message, data, { context }),
      error: (message: string, data?: any) => this.error(message, data, { context }),
      debug: (message: string, data?: any) => this.debug(message, data, { context }),
    }
  }

  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filteredLogs = this.logs

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level)
    }

    return filteredLogs.slice(-limit)
  }

  getStats() {
    return {
      total: this.logs.length,
      byLevel: {
        info: this.logs.filter((l) => l.level === "info").length,
        warn: this.logs.filter((l) => l.level === "warn").length,
        error: this.logs.filter((l) => l.level === "error").length,
        debug: this.logs.filter((l) => l.level === "debug").length,
      },
      maxLogs: this.maxLogs,
      currentLevel: this.logLevel,
    }
  }

  clear() {
    this.logs = []
  }
}

export const logger = new Logger()
