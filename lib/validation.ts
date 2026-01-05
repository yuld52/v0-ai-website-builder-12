// Input validation utilities
import { z } from "zod"

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

export const schemas = {
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(5000, "Prompt too long"),

  projectTitle: z.string().min(1, "Title is required").max(100, "Title too long"),

  projectCreate: z.object({
    name: z.string().min(1).max(100),
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    code: z.string().min(10, "Code must be at least 10 characters"),
    userId: z.string().optional(),
  }),

  projectUpdate: z.object({
    name: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    code: z.string().min(10).optional(),
    isFavorite: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),

  chatCreate: z.object({
    title: z.string().min(1).max(200),
    projectId: z.string().optional(),
  }),

  generateRequest: z.object({
    prompt: z.string().min(3).max(5000),
    currentCode: z.string().optional(),
    conversationHistory: z.array(z.any()).optional(),
  }),
}

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: ValidationError } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: new ValidationError(firstError.message, firstError.path.join("."), error.errors),
      }
    }
    return {
      success: false,
      error: new ValidationError("Validation failed", undefined, error),
    }
  }
}

export const validators = {
  isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  minLength(str: string, min: number): boolean {
    return str.length >= min
  },

  maxLength(str: string, max: number): boolean {
    return str.length <= max
  },

  isRequired(value: any): boolean {
    return value !== null && value !== undefined && value !== ""
  },

  validatePrompt(prompt: string): void {
    const result = validateData(schemas.prompt, prompt)
    if (!result.success) {
      throw result.error
    }
  },

  validateProjectTitle(title: string): void {
    const result = validateData(schemas.projectTitle, title)
    if (!result.success) {
      throw result.error
    }
  },

  validateCode(code: string): void {
    if (!this.isRequired(code)) {
      throw new ValidationError("Code is required", "code")
    }

    if (!this.minLength(code, 10)) {
      throw new ValidationError("Code must be at least 10 characters", "code")
    }
  },
}

export const validateRequest = (data: any, rules: Record<string, (value: any) => boolean>): void => {
  for (const [field, rule] of Object.entries(rules)) {
    if (!rule(data[field])) {
      throw new ValidationError(`Validation failed for field: ${field}`, field)
    }
  }
}
