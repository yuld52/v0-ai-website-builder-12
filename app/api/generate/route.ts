import { type NextRequest, NextResponse } from "next/server"
import { cache } from "@/lib/cache"
import { validateData, schemas } from "@/lib/validation"
import { logger } from "@/lib/logger"
import { ApiResponse } from "@/lib/api-response"
import { SYSTEM_PROMPTS, validateGeneratedCode } from "@/lib/prompts"

export async function POST(request: NextRequest) {
  const requestId = `gen_${Date.now()}`
  const contextLogger = logger.withContext({ requestId })

  try {
    const body = await request.json()

    const validation = validateData(schemas.generateRequest, body)
    if (!validation.success) {
      contextLogger.warn("Validation failed", { error: validation.error.message })
      return ApiResponse.badRequest(validation.error.message, validation.error.details)
    }

    const { prompt, currentCode, conversationHistory } = validation.data

    if (!prompt || prompt.trim().length === 0) {
      return ApiResponse.badRequest("O prompt não pode estar vazio.")
    }

    if (prompt.trim().length < 3) {
      return ApiResponse.badRequest("O prompt precisa ter pelo menos 3 caracteres.")
    }

    contextLogger.info("Generate request received", {
      promptLength: prompt.length,
      hasCurrentCode: !!currentCode,
      historyLength: conversationHistory?.length,
    })

    const cacheKey = `generate:${requestId}:${prompt.substring(0, 50)}:${currentCode ? "edit" : "new"}`
    const cached = cache.get(cacheKey)
    if (cached) {
      contextLogger.info("Returning cached result")
      return NextResponse.json(cached)
    }

    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      contextLogger.error("Missing OPENROUTER_API_KEY environment variable")
      return ApiResponse.error(
        "Configuração da API incompleta. Configure OPENROUTER_API_KEY nas variáveis de ambiente.",
        500,
      )
    }

    const systemPrompt = currentCode ? SYSTEM_PROMPTS.edit : SYSTEM_PROMPTS.create

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...(conversationHistory || []),
    ]

    if (currentCode) {
      messages.push({
        role: "system",
        content: `CÓDIGO ATUAL DO SITE:\n\n${currentCode}\n\n=================\nIMPORTANTE: ANALISE O CÓDIGO ACIMA CUIDADOSAMENTE e faça APENAS as modificações solicitadas pelo usuário. Mantenha toda a estrutura, estilos e funcionalidades não mencionadas EXATAMENTE como estão. Retorne o HTML COMPLETO modificado.`,
      })
    }

    messages.push({
      role: "user",
      content: prompt,
    })

    contextLogger.info("Calling OpenRouter API", { model: "mistralai/devstral-2512:free" })

    const maxRetries = 3
    const timeout = 60000 // Aumentado para 60 segundos para dar mais tempo à IA
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        contextLogger.info("Preparing OpenRouter API call", {
          attempt: attempt + 1,
          hasApiKey: !!apiKey,
          apiKeyLength: apiKey?.length,
          messagesCount: messages.length,
          origin: request.headers.get("origin"),
        })

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": request.headers.get("origin") || "https://wexar.ai",
            "X-Title": "Wexar AI Website Generator",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/devstral-2512:free",
            messages,
            temperature: 0.9, // temperatura ajustada para maior criatividade
            max_tokens: 8000,
            top_p: 0.9, // top_p adicionado para melhor qualidade
            frequency_penalty: 0.3, // penalidade de frequência para evitar repetições
            presence_penalty: 0.3, // penalidade de presença para maior diversidade
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        contextLogger.info("OpenRouter API response", { status: response.status })

        if (!response.ok) {
          const errorText = await response.text()
          contextLogger.error("OpenRouter API error", { error: errorText, attempt: attempt + 1 })

          if (response.status === 502 || response.status === 503 || response.status === 504) {
            lastError = new Error(`Servidor temporariamente indisponível (${response.status})`)
            if (attempt < maxRetries - 1) {
              const backoffTime = Math.pow(2, attempt) * 1000
              contextLogger.info("Retrying OpenRouter API call", { backoffTime })
              await new Promise((resolve) => setTimeout(resolve, backoffTime))
              continue
            }
          } else if (response.status === 429) {
            return ApiResponse.error("Limite de requisições excedido. Tente novamente em alguns minutos.", 429)
          } else if (response.status === 401) {
            return ApiResponse.error("Chave API inválida. Verifique a configuração.", 500)
          } else {
            return ApiResponse.error(`Erro na API: ${response.status}`, response.status)
          }
        }

        const data = await response.json()

        const fullResponse = data.choices?.[0]?.message?.content

        if (data.choices?.[0]?.error) {
          const providerError = data.choices[0].error

          if (fullResponse && fullResponse.trim().length > 100) {
            contextLogger.warn("Provider warning (content available)", {
              error: providerError.message || providerError.code,
            })
          } else {
            contextLogger.error("Provider error (no usable content)", { error: providerError })

            if (
              providerError.code === 502 ||
              providerError.message?.includes("Network connection lost") ||
              providerError.message?.includes("Connection") ||
              providerError.code >= 500
            ) {
              lastError = new Error(`Erro do provedor: ${providerError.message || "Conexão perdida"}`)

              if (attempt < maxRetries - 1) {
                const backoffTime = Math.pow(2, attempt) * 1000
                contextLogger.info("Retrying after provider error", { backoffTime })
                await new Promise((resolve) => setTimeout(resolve, backoffTime))
                continue
              }
            }

            return ApiResponse.error(
              `Erro do provedor: ${providerError.message || "Falha na geração"}. ${attempt >= maxRetries - 1 ? "Todas as tentativas falharam." : ""}`,
              500,
            )
          }
        }

        if (!fullResponse || fullResponse.trim().length === 0) {
          contextLogger.error("No content in API response", { response: data })

          if (attempt < maxRetries - 1) {
            lastError = new Error("Resposta vazia do servidor")
            const backoffTime = Math.pow(2, attempt) * 1000
            contextLogger.info("Retrying after empty response", { backoffTime })
            await new Promise((resolve) => setTimeout(resolve, backoffTime))
            continue
          }

          return ApiResponse.error("Nenhuma resposta foi gerada. Por favor, tente novamente.", 500)
        }

        let explanation = ""
        let code = ""

        const explanationMatch = fullResponse.match(/\[EXPLICAÇÃO\]([\s\S]*?)\[\/EXPLICAÇÃO\]/i)
        const codeMatch = fullResponse.match(/\[CÓDIGO\]([\s\S]*?)\[\/CÓDIGO\]/i)

        if (codeMatch) {
          code = codeMatch[1].trim()
        }

        if (explanationMatch) {
          explanation = explanationMatch[1].trim()
        }

        if (!code) {
          const htmlMatch = fullResponse.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i)

          if (htmlMatch) {
            code = htmlMatch[0]

            const htmlStartIndex = fullResponse.indexOf("<!DOCTYPE")
            if (htmlStartIndex > 0) {
              explanation = fullResponse.substring(0, htmlStartIndex).trim()
              explanation = explanation
                .replace(/^#+\s+/gm, "")
                .replace(/\*\*/g, "")
                .replace(/\*/g, "")
                .replace(/^-\s+/gm, "")
                .trim()
            }

            if (!explanation) {
              explanation = currentCode ? "Site atualizado com sucesso!" : "Site criado!"
            }
          } else {
            contextLogger.warn("Could not find HTML DOCTYPE, using entire response as code")
            code = fullResponse
            explanation = currentCode ? "Alterei o site conforme solicitado." : "Site criado!"
          }
        }

        const cleanedCode = code
          .replace(/\[EXPLICAÇÃO\][\s\S]*?\[\/EXPLICAÇÃO\]/gi, "")
          .replace(/\[CÓDIGO\]/gi, "")
          .replace(/\[\/CÓDIGO\]/gi, "")
          .replace(/```html\n?/gi, "")
          .replace(/```\n?/g, "")
          .trim()

        const codeValidation = validateGeneratedCode(cleanedCode)

        if (!codeValidation.isValid) {
          contextLogger.error("Generated code validation failed", {
            errors: codeValidation.errors,
            warnings: codeValidation.warnings,
            codePreview: cleanedCode.substring(0, 500),
          })

          if (attempt >= maxRetries - 1) {
            contextLogger.warn("Attempting automatic code repair")

            // Tenta adicionar tags faltantes
            let repairedCode = cleanedCode

            if (!repairedCode.includes("<!DOCTYPE")) {
              repairedCode = "<!DOCTYPE html>\n" + repairedCode
            }

            if (!repairedCode.includes("</body>") && repairedCode.includes("<body")) {
              repairedCode = repairedCode + "\n</body>"
            }

            if (!repairedCode.includes("</html>") && repairedCode.includes("<html")) {
              repairedCode = repairedCode + "\n</html>"
            }

            // Valida novamente
            const revalidation = validateGeneratedCode(repairedCode)

            if (revalidation.isValid) {
              contextLogger.info("Code repaired successfully")
              const result = {
                code: repairedCode,
                explanation,
                conversational: true,
              }
              cache.set(cacheKey, result, 3600)
              return NextResponse.json(result)
            }

            return ApiResponse.error(
              `Código gerado é inválido: ${codeValidation.errors.join(", ")}. Por favor, tente novamente.`,
              500,
            )
          }

          // Caso contrário, tente novamente
          lastError = new Error("Código gerado é inválido")
          const backoffTime = Math.pow(2, attempt) * 1000
          contextLogger.info("Retrying due to invalid code", { backoffTime })
          await new Promise((resolve) => setTimeout(resolve, backoffTime))
          continue
        }

        // Log warnings but don't fail
        if (codeValidation.warnings.length > 0) {
          contextLogger.warn("Code validation warnings", { warnings: codeValidation.warnings })
        }

        contextLogger.info("Code generated successfully", {
          codeLength: cleanedCode.length,
          hasExplanation: !!explanation,
          validationWarnings: codeValidation.warnings.length,
        })

        const result = {
          code: cleanedCode,
          explanation,
          conversational: true,
        }

        cache.set(cacheKey, result, 3600)

        return NextResponse.json(result)
      } catch (fetchError) {
        const errorDetails = {
          name: fetchError instanceof Error ? fetchError.name : "Unknown",
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          stack: fetchError instanceof Error ? fetchError.stack : undefined,
          attempt: attempt + 1,
          maxRetries,
        }

        contextLogger.error("Fetch error", errorDetails)

        if (fetchError instanceof Error) {
          if (fetchError.name === "AbortError") {
            lastError = new Error("Requisição expirou. O servidor demorou muito para responder.")
          } else if (fetchError.message.includes("fetch")) {
            lastError = new Error("Erro de conexão. Verifique sua conexão com a internet e tente novamente.")
          } else {
            lastError = fetchError
          }
        } else {
          lastError = new Error(`Erro desconhecido: ${String(fetchError)}`)
        }

        if (attempt < maxRetries - 1) {
          const backoffTime = Math.pow(2, attempt) * 1000
          contextLogger.info("Retrying after network error", {
            backoffTime,
            remainingAttempts: maxRetries - attempt - 1,
          })
          await new Promise((resolve) => setTimeout(resolve, backoffTime))
          continue
        }
      }
    }

    return ApiResponse.error(
      lastError?.message || "Falha após múltiplas tentativas. Verifique sua conexão e tente novamente.",
      500,
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : typeof error

    contextLogger.error("Error in generate route", {
      error: errorMessage,
      errorName,
      errorStack,
      errorType: typeof error,
      errorString: String(error),
    })

    return ApiResponse.error(errorMessage, 500)
  }
}
