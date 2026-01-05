"use client"

import { useState, Suspense, useEffect, useCallback } from "react"
import RuixenMoonChat from "@/components/ui/ruixen-moon-chat"
import { useProjects } from "@/lib/hooks/use-projects"
import { useAnalytics } from "@/lib/hooks/use-analytics"

interface Generation {
  id: string
  userPrompt: string
  code: string
  timestamp: Date
  editCount: number
  title?: string
  description?: string
  isFavorite?: boolean
  messages?: Array<{ role: "user" | "assistant"; content: string }>
}

export default function AIWebsiteGenerator() {
  return (
    <Suspense fallback={null}>
      <AIWebsiteGeneratorContent />
    </Suspense>
  )
}

function AIWebsiteGeneratorContent() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null)
  const [showProjects, setShowProjects] = useState(false)

  const { projects, loading: projectsLoading, createProject, updateProject, refresh: refreshProjects } = useProjects()
  const { track } = useAnalytics()

  useEffect(() => {
    track("page_view", { page: "ai_website_generator" })
  }, [track])

  const loadProjects = useCallback(() => {
    refreshProjects()
    setShowProjects(true)
    track("projects_opened")
  }, [refreshProjects, track])

  const handleSelectProject = useCallback(
    (project: any) => {
      setActiveGeneration({
        id: project.id,
        userPrompt: project.description,
        code: project.code,
        timestamp: new Date(project.createdAt),
        editCount: project.versions?.length || 0,
        title: project.name,
        description: project.description,
        messages: [],
      })
      setShowProjects(false)
      track("project_selected", { projectId: project.id })
    },
    [track],
  )

  const handleCloseProjects = useCallback(() => {
    setShowProjects(false)
  }, [])

  const applyTemplate = useCallback((templatePrompt: string) => {
    setPrompt(templatePrompt)
    setTimeout(() => generateWebsite(), 100)
  }, [])

  const handleBackToDashboard = useCallback(() => {
    setActiveGeneration(null)
    setPrompt("")
    setShowProjects(false)
  }, [])

  const generateWebsite = useCallback(async () => {
    if (!prompt.trim()) {
      return
    }

    console.log("[v0] generateWebsite called with prompt:", prompt.substring(0, 50))

    setIsGenerating(true)
    const currentPrompt = prompt
    setPrompt("") // Limpar prompt após iniciar geração

    track("generation_started", { promptLength: currentPrompt.length })

    const tempGeneration: Generation = {
      id: Date.now().toString(),
      userPrompt: currentPrompt,
      code: "",
      timestamp: new Date(),
      editCount: 0,
      messages: [{ role: "user" as const, content: currentPrompt }],
    }

    setActiveGeneration(tempGeneration)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          currentCode: activeGeneration?.code,
          conversationHistory: activeGeneration?.messages || [],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao gerar o site")
      }

      const data = await response.json()

      console.log("[v0] Generation response received:", {
        hasCode: !!data.code,
        codeLength: data.code?.length,
        explanation: data.explanation?.substring(0, 50),
      })

      if (!data.code || data.code.trim().length === 0) {
        throw new Error("Código gerado está vazio. Por favor, tente novamente.")
      }

      const assistantMessage = data.explanation || "Criei o site para você!"

      const newGeneration: Generation = {
        ...tempGeneration,
        code: data.code,
        editCount: (activeGeneration?.editCount || 0) + 1,
        messages: [
          ...(activeGeneration?.messages || []),
          { role: "user", content: currentPrompt },
          { role: "assistant", content: assistantMessage },
        ],
      }

      console.log("[v0] Saving project:", {
        hasActiveGeneration: !!activeGeneration?.id,
        newGenerationId: newGeneration.id,
        codeLength: data.code.length,
      })

      console.log("[v0] Code validation:", {
        hasHTML: newGeneration.code.includes("<html") || newGeneration.code.includes("<!DOCTYPE"),
        hasBody: newGeneration.code.includes("<body"),
        codePreview: newGeneration.code.substring(0, 300),
      })

      if (activeGeneration?.id) {
        await updateProject(activeGeneration.id, {
          code: data.code,
          description: currentPrompt,
        })
      } else {
        const savedProject = await createProject({
          name: currentPrompt.slice(0, 50),
          description: currentPrompt,
          code: data.code,
        })
        console.log("[v0] Project created:", { projectId: savedProject.id })
        newGeneration.id = savedProject.id
      }

      setActiveGeneration(newGeneration)

      console.log("[v0] Generation completed successfully, activeGeneration set")

      track("generation_completed", {
        projectId: newGeneration.id,
        codeLength: data.code.length,
        editCount: newGeneration.editCount,
      })
    } catch (error) {
      console.error("Error generating website:", error)

      let errorMessage = "Ocorreu um erro ao gerar o site"
      let errorDescription = "Por favor, tente novamente em alguns instantes."

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Tempo esgotado"
          errorDescription = "A geração demorou muito. Tente com um prompt mais simples."
        } else {
          errorDescription = error.message
        }
      }

      track("generation_failed", {
        error: errorDescription,
        promptLength: currentPrompt.length,
      })

      setActiveGeneration({
        ...tempGeneration,
        messages: [
          { role: "user", content: currentPrompt },
          {
            role: "assistant",
            content: `Desculpe, ocorreu um erro: ${errorDescription}. Por favor, tente novamente ou reformule seu pedido.`,
          },
        ],
      })
    } finally {
      clearTimeout(timeoutId)
      setIsGenerating(false)
    }
  }, [prompt, activeGeneration, createProject, updateProject, track])

  const handlePublish = useCallback(async () => {
    if (!activeGeneration?.code || !activeGeneration?.id) return

    try {
      const response = await fetch(`/api/projects/${activeGeneration.id}/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: "vercel",
          environment: "production",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to deploy")
      }

      const data = await response.json()
      const deployment = data.data

      track("project_deployed", {
        projectId: activeGeneration.id,
        platform: "vercel",
        deploymentId: deployment.id,
      })

      if (deployment.url) {
        window.open(deployment.url, "_blank")
      }
    } catch (error) {
      console.error("Error deploying:", error)
      track("deployment_failed", { projectId: activeGeneration.id })
    }
  }, [activeGeneration, track])

  return (
    <RuixenMoonChat
      prompt={prompt}
      onPromptChange={setPrompt}
      onSubmit={generateWebsite}
      isGenerating={isGenerating}
      activeGeneration={activeGeneration}
      onBackToDashboard={handleBackToDashboard}
      showProjects={showProjects}
      projects={projects}
      onShowProjects={loadProjects}
      onSelectProject={handleSelectProject}
      onCloseProjects={handleCloseProjects}
    />
  )
}
