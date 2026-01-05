"use client"

import type React from "react"
import { useRef, useEffect, useCallback, useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowUpIcon,
  Code2,
  Eye,
  ArrowLeft,
  Plus,
  ArrowRight,
  Sparkles,
  Github,
  MessageCircle,
  Search,
  Settings,
  CreditCard,
  LogOut,
  RefreshCw,
  ExternalLink,
  Monitor,
  Loader2,
  Paperclip,
  MousePointer2,
  FileCode,
  File,
  Folder,
  FolderOpen,
  Download,
  Tablet,
  Smartphone,
  Copy,
} from "lucide-react"
import { PricingPopup } from "@/components/pricing-popup"
import { SettingsModal } from "@/components/settings-modal"
import { TokensModal } from "@/components/tokens-modal"
import { AccountModal } from "@/components/account-modal"
import { HelpCenterModal } from "@/components/help-center-modal"
import { FigmaImportModal } from "@/components/figma-import-modal"
import { GithubImportModal } from "@/components/github-import-modal"
import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"
import { useToast } from "@/components/ui/use-toast"
import { useProjects } from "@/lib/hooks/use-projects"
import { type Language, getTranslation } from "@/lib/i18n"

interface AutoResizeProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))
      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`
  }, [minHeight])

  return { textareaRef, adjustHeight }
}

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

interface RuixenMoonChatProps {
  prompt: string
  onPromptChange: (prompt: string) => void
  onSubmit: () => void
  isGenerating: boolean
  activeGeneration?: Generation | null
  onBackToDashboard?: () => void
  showProjects?: boolean
  projects?: any[]
  onShowProjects?: () => void
  onSelectProject?: (project: any) => void
  onCloseProjects?: () => void
  projectName?: string // Added
  initialMessages?: any[] // Added
  selectedModel?: string // Added
  // Added props for new functionality
  currentCode?: string
  onUpdateCode?: (code: string) => void
  onSwitchVersion?: (versionId: string) => void
  selectedVersion?: string
  onRefresh?: () => void
  onShare?: (generation: Generation) => void
  onPublish?: (generation: Generation) => void
}

export default function RuixenMoonChat({
  prompt,
  onPromptChange,
  onSubmit,
  isGenerating,
  activeGeneration,
  onBackToDashboard,
  showProjects,
  projects,
  onShowProjects,
  onSelectProject,
  onCloseProjects,
  projectName, // Added
  initialMessages, // Added
  selectedModel: propModel, // Added
  // Destructuring added props
  currentCode,
  onUpdateCode,
  onSwitchVersion,
  selectedVersion,
  onRefresh,
  onShare,
  onPublish,
}: RuixenMoonChatProps) {
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState<"preview" | "code">("preview")
  const [selectedModel, setSelectedModel] = useState("DeepSeek")
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorFileInputRef = useRef<HTMLInputElement>(null)
  const figmaInputRef = useRef<HTMLInputElement>(null)
  const githubInputRef = useRef<HTMLInputElement>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showPricingPopup, setShowPricingPopup] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showTokensModal, setShowTokensModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false)
  const [showFigmaImportModal, setShowFigmaImportModal] = useState(false)
  const [showGithubImportModal, setShowGithubImportModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null)
  const [isElementSelectMode, setIsElementSelectMode] = useState(false)
  const [showRoutes, setShowRoutes] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(initialMessages || [])

  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]))

  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)

  // State for detected routes
  const [detectedRoutes, setDetectedRoutes] = useState<string[]>([])

  const { adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  })

  const { createProject, updateProject: updateProjectHook } = useProjects()

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wexar-settings")
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          return (settings.language || "pt") as Language
        } catch {
          return "pt"
        }
      }
    }
    return "pt"
  })

  const t = useCallback((key: string) => getTranslation(currentLanguage, key as any), [currentLanguage])

  // Moved these functions before the useEffect that uses them to fix lint error
  const handleRefresh = useCallback(() => {
    if (!activeGeneration?.code || !iframeRef.current) return

    console.log("[v0] Refreshing preview")

    const iframe = iframeRef.current

    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.location.reload()
      }
    } catch (e) {
      const currentCode = activeGeneration.code
      iframe.srcdoc = ""
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = currentCode
        }
      }, 50)
    }
  }, [activeGeneration?.code])

  const handleShare = useCallback(async () => {
    if (!activeGeneration) return

    console.log("[v0] Sharing project for remix:", activeGeneration.id)

    try {
      const blob = new Blob([activeGeneration.code], { type: "text/html" })
      const blobUrl = URL.createObjectURL(blob)

      const remixUrl = `${window.location.origin}/remix?code=${encodeURIComponent(activeGeneration.code)}&id=${activeGeneration.id}`

      await navigator.clipboard.writeText(remixUrl)

      const message = `✅ Link de remix copiado!\n\nURL: ${remixUrl}\n\nCompartilhe este link para permitir que outros façam remix do seu projeto.`
      alert(message)

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {
      console.error("[v0] Share error:", error)
      alert("Erro ao compartilhar. Tente novamente.")
    }
  }, [activeGeneration])

  const handlePublish = useCallback(async () => {
    if (!activeGeneration?.code) return

    console.log("[v0] Publishing project:", activeGeneration.id)

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeGeneration.id,
          code: activeGeneration.code,
          title: activeGeneration.title,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Publish failed")
      }

      const { url, message, isPreview } = await response.json()

      setPublishedUrl(url)

      toast({
        title: isPreview ? "Preview Gerado!" : "Site Publicado!",
        description: isPreview
          ? "Configure VERCEL_TOKEN para deploy real na Vercel"
          : "Seu site está online e acessível publicamente!",
        duration: 10000,
      })

      window.open(url, "_blank")
    } catch (error) {
      console.error("[v0] Publish error:", error)
      toast({
        title: "Erro ao publicar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    }
  }, [activeGeneration, toast])

  const [isTyping, setIsTyping] = useState(false) // Declared isTyping
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping = ["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable
      setIsTyping(isTyping) // Set isTyping state

      // Don't handle global shortcuts when typing in textarea (except for specific ones)
      if (isTyping && !["Escape"].includes(e.key)) {
        // Only allow Escape and textarea-specific shortcuts when typing
        return
      }

      // Ctrl/Cmd + K - Focus on prompt input (only when NOT typing)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        textareaRef.current?.focus()
        console.log("[v0] Keyboard shortcut: Focus prompt (Ctrl/Cmd+K)")
        return
      }

      // Ctrl/Cmd + Enter - Submit prompt (works everywhere)
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isGenerating) {
        e.preventDefault()
        if (prompt.trim()) {
          onSubmit()
          console.log("[v0] Keyboard shortcut: Submit (Ctrl/Cmd+Enter)")
        }
        return
      }

      // Ctrl/Cmd + B - Toggle Preview/Code
      if ((e.ctrlKey || e.metaKey) && e.key === "b" && activeGeneration?.code) {
        e.preventDefault()
        setSelectedTab((prev) => (prev === "preview" ? "code" : "preview"))
        console.log("[v0] Keyboard shortcut: Toggle tab (Ctrl/Cmd+B)")
        return
      }

      // Ctrl/Cmd + R - Refresh preview
      if ((e.ctrlKey || e.metaKey) && e.key === "r" && activeGeneration?.code) {
        e.preventDefault()
        handleRefresh()
        console.log("[v0] Keyboard shortcut: Refresh (Ctrl/Cmd+R)")
        return
      }

      // Ctrl/Cmd + S - Share/Save project
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && activeGeneration) {
        e.preventDefault()
        handleShare()
        console.log("[v0] Keyboard shortcut: Share (Ctrl/Cmd+S)")
        return
      }

      // Ctrl/Cmd + P - Publish project
      if ((e.ctrlKey || e.metaKey) && e.key === "p" && activeGeneration?.code) {
        e.preventDefault()
        handlePublish()
        console.log("[v0] Keyboard shortcut: Publish (Ctrl/Cmd+P)")
        return
      }

      // Ctrl/Cmd + O - Open projects
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault()
        if (onShowProjects) {
          onShowProjects()
          console.log("[v0] Keyboard shortcut: Open projects (Ctrl/Cmd+O)")
        }
        return
      }

      // Ctrl/Cmd + H - Toggle help center
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault()
        setShowHelpCenterModal((prev) => !prev)
        console.log("[v0] Keyboard shortcut: Toggle help (Ctrl/Cmd+H)")
        return
      }

      // Escape - Close modals or go back
      if (e.key === "Escape") {
        if (showHelpCenterModal) {
          setShowHelpCenterModal(false)
        } else if (showSettingsModal) {
          setShowSettingsModal(false)
        } else if (showTokensModal) {
          setShowTokensModal(false)
        } else if (showAccountModal) {
          setShowAccountModal(false)
        } else if (showFigmaImportModal) {
          setShowFigmaImportModal(false)
        } else if (showGithubImportModal) {
          setShowGithubImportModal(false)
        } else if (showProjects && onCloseProjects) {
          onCloseProjects()
        } else if (activeGeneration && onBackToDashboard) {
          onBackToDashboard()
        } else if (isTyping) {
          // If typing and no modal is open, blur the textarea
          target.blur()
        }
        console.log("[v0] Keyboard shortcut: Escape")
        return
      }

      // Ctrl/Cmd + 1/2/3 - Change device mode (only when preview is active)
      if ((e.ctrlKey || e.metaKey) && activeGeneration?.code && selectedTab === "preview") {
        if (e.key === "1") {
          e.preventDefault()
          setDeviceMode("desktop")
          console.log("[v0] Keyboard shortcut: Desktop mode (Ctrl/Cmd+1)")
        } else if (e.key === "2") {
          e.preventDefault()
          setDeviceMode("tablet")
          console.log("[v0] Keyboard shortcut: Tablet mode (Ctrl/Cmd+2)")
        } else if (e.key === "3") {
          e.preventDefault()
          setDeviceMode("mobile")
          console.log("[v0] Keyboard shortcut: Mobile mode (Ctrl/Cmd+3)")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    prompt,
    isGenerating,
    onSubmit,
    activeGeneration,
    selectedTab,
    showHelpCenterModal,
    showSettingsModal,
    showTokensModal,
    showAccountModal,
    showFigmaImportModal,
    showGithubImportModal,
    showProjects,
    onShowProjects,
    onCloseProjects,
    onBackToDashboard,
    handleRefresh,
    handleShare,
    handlePublish,
    textareaRef,
    isTyping,
  ])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setUploadedFile({
        name: file.name,
        size: file.size,
      })
      console.log("[v0] Files selected:", files.length)

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/files/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`)
          }

          return await response.json()
        })

        const results = await Promise.all(uploadPromises)
        console.log("[v0] Files uploaded:", results)
        alert(`${files.length} arquivo(s) enviado(s) com sucesso!`)
      } catch (error) {
        console.error("[v0] Upload error:", error)
        alert("Erro ao enviar arquivos. Tente novamente.")
      }
    }
  }, [])

  const handleFigmaImport = useCallback(async () => {
    setShowFigmaImportModal(true)
  }, [])

  const handleGithubImport = useCallback(async () => {
    setShowGithubImportModal(true)
  }, [])

  const handleElementSelect = useCallback(() => {
    setIsElementSelectMode((prev) => !prev)
    console.log("[v0] Element selector mode toggled:", !isElementSelectMode)

    if (!isElementSelectMode) {
      alert("Clique em um elemento no preview para selecioná-lo e editá-lo")
    }
  }, [isElementSelectMode])

  const handleDevicePreview = useCallback(() => {
    setDeviceMode((prev) => {
      const modes: Array<"desktop" | "tablet" | "mobile"> = ["desktop", "tablet", "mobile"]
      const currentIndex = modes.indexOf(prev)
      const nextMode = modes[(currentIndex + 1) % modes.length]
      console.log("[v0] Device mode changed to:", nextMode)
      return nextMode
    })
  }, [])

  const detectRoutes = useCallback((code: string) => {
    const routes: string[] = ["/"]

    // Detectar links internos no HTML
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
    let match

    while ((match = linkRegex.exec(code)) !== null) {
      const href = match[1]
      // Filtrar apenas rotas internas (começam com / ou #)
      if (href.startsWith("/") && !href.startsWith("//") && !routes.includes(href)) {
        routes.push(href)
      }
    }

    // Detectar seções com IDs para âncoras
    const idRegex = /id=["']([^"']+)["']/gi
    while ((match = idRegex.exec(code)) !== null) {
      const id = match[1]
      const anchor = `#${id}`
      if (!routes.includes(anchor)) {
        routes.push(anchor)
      }
    }

    return routes
  }, [])

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      setShowRoutes(value.length > 0 || detectedRoutes.length > 1)
    },
    [detectedRoutes.length],
  )

  const handleNavigateToRoute = useCallback((route: string) => {
    if (!iframeRef.current?.contentWindow) return

    console.log("[v0] Navigating to route:", route)

    if (route.startsWith("#")) {
      // Para âncoras, fazer scroll suave
      const element = iframeRef.current.contentWindow.document.querySelector(route)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      // Para outras rotas, atualizar URL (simulado)
      alert(`Navegando para: ${route}`)
    }

    setSearchQuery(route)
    setShowRoutes(false)
  }, [])

  useEffect(() => {
    if (activeGeneration?.code) {
      const routes = detectRoutes(activeGeneration.code)
      setDetectedRoutes(routes)
      console.log("[v0] Detected routes:", routes)
    }
  }, [activeGeneration?.code, detectRoutes])

  const handleOpenInNewTab = useCallback(() => {
    if (!activeGeneration?.code) return

    console.log("[v0] Opening preview in new tab")
    const blob = new Blob([activeGeneration.code], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")

    // Cleanup after a delay
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }, [activeGeneration?.code])

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (prompt.trim().length >= 3 && !isGenerating && !isSubmitting) {
          console.log("[v0] Submit triggered, calling onSubmit")
          setIsSubmitting(true)
          onSubmit()
          // Reset flag after a short delay
          setTimeout(() => setIsSubmitting(false), 1000)
        }
      }
    },
    [prompt, isGenerating, isSubmitting, onSubmit],
  )

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onPromptChange(e.target.value)
      adjustHeight()
    },
    [onPromptChange, adjustHeight],
  )

  const hasCode = activeGeneration?.code && activeGeneration.code.trim().length > 0

  // useEffect for updating the iframe when the code changes
  useEffect(() => {
    if (activeGeneration?.code && iframeRef.current) {
      console.log("[v0] Updating iframe with new code:", {
        generationId: activeGeneration.id,
        codeLength: activeGeneration.code.length,
      })
      // Forçar atualização do iframe via ref
      const iframe = iframeRef.current
      if (iframe.contentWindow) {
        iframe.srcdoc = activeGeneration.code
      }
    }
  }, [activeGeneration?.id, activeGeneration?.code])

  const extractFilesFromCode = useCallback((htmlCode: string) => {
    const files: { [key: string]: string } = {}

    // Extrair múltiplos arquivos CSS
    const styleMatches = htmlCode.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)
    let cssIndex = 0
    for (const match of styleMatches) {
      if (match[1].trim()) {
        const fileName = cssIndex === 0 ? "css/styles.css" : `css/styles-${cssIndex}.css`
        files[fileName] = match[1].trim()
        cssIndex++
      }
    }

    // Extrair múltiplos arquivos JavaScript
    const scriptMatches = htmlCode.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)
    let jsIndex = 0
    for (const match of scriptMatches) {
      // Ignorar CDNs e scripts vazios
      if (
        match[1].trim() &&
        !match[0].includes("cdn.") &&
        !match[0].includes("http://") &&
        !match[0].includes("https://")
      ) {
        const fileName = jsIndex === 0 ? "js/script.js" : `js/script-${jsIndex}.js`
        files[fileName] = match[1].trim()
        jsIndex++
      }
    }

    // Detectar e extrair imagens base64
    const imgMatches = htmlCode.matchAll(/<img[^>]+src=["'](data:image\/([^;]+);base64,([^"']+))["'][^>]*>/gi)
    let imgIndex = 0
    for (const match of imgMatches) {
      const imageType = match[2] || "png"
      const fileName = `images/image-${imgIndex}.${imageType}`
      files[fileName] = match[1] // Guardar data URL completo
      imgIndex++
    }

    // Detectar URLs de imagens externas para criar placeholders
    const imgUrlMatches = htmlCode.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
    let urlImgIndex = 0
    for (const match of imgUrlMatches) {
      const src = match[1]
      // Se não for data URL e não for já processado
      if (!src.startsWith("data:") && !src.startsWith("#")) {
        const ext = src.split(".").pop()?.split("?")[0] || "jpg"
        const fileName = `images/external-${urlImgIndex}.${ext}`
        files[fileName] = `/* External image URL: ${src} */`
        urlImgIndex++
      }
    }

    // Detectar e extrair SVGs inline
    const svgMatches = htmlCode.matchAll(/<svg[^>]*>([\s\S]*?)<\/svg>/gi)
    let svgIndex = 0
    for (const match of svgMatches) {
      const fileName = `assets/icon-${svgIndex}.svg`
      files[fileName] = match[0]
      svgIndex++
    }

    // Criar arquivo HTML principal com referências aos arquivos externos
    let processedHtml = htmlCode

    // Substituir styles inline por links
    if (cssIndex > 0) {
      processedHtml = processedHtml.replace(
        /<style[^>]*>[\s\S]*?<\/style>/gi,
        '<link rel="stylesheet" href="css/styles.css">',
      )
    }

    // Substituir scripts inline por links
    if (jsIndex > 0) {
      processedHtml = processedHtml.replace(
        /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/gi,
        '<script src="js/script.js"></script>',
      )
    }

    files["index.html"] = processedHtml

    // Adicionar README.md
    files["README.md"] = `# Generated Website

This website was generated by Wexar AI.

## Structure

${Object.keys(files)
  .map((file) => `- ${file}`)
  .join("\n")}

## How to run

Simply open \`index.html\` in your browser.
`

    // Adicionar package.json para projetos mais complexos
    if (jsIndex > 0 || cssIndex > 0) {
      files["package.json"] = JSON.stringify(
        {
          name: "wexar-generated-site",
          version: "1.0.0",
          description: "Website generated by Wexar AI",
          scripts: {
            start: "npx serve .",
          },
        },
        null,
        2,
      )
    }

    return files
  }, [])

  const fileStructure = useMemo(() => {
    const files = Object.keys(extractFilesFromCode(activeGeneration?.code || ""))
    const tree: { [key: string]: string[] } = {}

    files.forEach((file) => {
      if (file.includes("/")) {
        const [folder] = file.split("/")
        if (!tree[folder]) {
          tree[folder] = []
        }
        tree[folder].push(file)
      } else {
        if (!tree["/"]) {
          tree["/"] = []
        }
        tree["/"].push(file) // Corrected: Pushing file to root folder array
      }
    })
    // Ensure root folder is always present if there are files
    if (!tree["/"] && files.length > 0) {
      tree["/"] = []
    }

    return tree
  }, [activeGeneration?.code, extractFilesFromCode]) // Added extractFilesFromCode dependency

  const toggleFolder = useCallback((folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderPath)) {
        next.delete(folderPath)
      } else {
        next.add(folderPath)
      }
      return next
    })
  }, [])

  const downloadFile = useCallback((fileName: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // useEffect for updating the selected file when switching to code tab
  useEffect(() => {
    if (selectedTab === "code" && !selectedFile && Object.keys(fileStructure).length > 0) {
      // Ensure to select a file that actually exists in the structure
      const firstFile = Object.keys(fileStructure)
        .flatMap((folder) => fileStructure[folder])
        .find((file) => file !== undefined)
      if (firstFile) {
        setSelectedFile(firstFile)
      }
    }
  }, [selectedTab, selectedFile, fileStructure])

  const handleGithubPush = useCallback(async () => {
    if (!activeGeneration?.code) return

    const repoName = prompt("Nome do repositório GitHub:", `wexar-${activeGeneration.id.slice(0, 8)}`)
    if (!repoName) return

    const description = prompt("Descrição (opcional):", activeGeneration.title || "Generated by Wexar AI")

    console.log("[v0] Pushing to GitHub:", repoName)

    try {
      toast({
        title: "Enviando para GitHub...",
        description: "Criando repositório e fazendo push do código",
      })

      const response = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeGeneration.code,
          repoName,
          description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || "Failed to push to GitHub")
      }

      const { url, message } = await response.json()

      toast({
        title: "Enviado para GitHub!",
        description: "Seu código foi publicado no GitHub com sucesso",
        duration: 10000,
      })

      // Open GitHub repo in new tab
      window.open(url, "_blank")

      // Show success alert with URL
      alert(`✅ Código enviado para GitHub!\n\nRepositório: ${url}`)
    } catch (error) {
      console.error("[v0] GitHub push error:", error)
      toast({
        title: "Erro ao enviar para GitHub",
        description: error instanceof Error ? error.message : "Configure GITHUB_TOKEN nas variáveis de ambiente",
        variant: "destructive",
      })
    }
  }, [activeGeneration, toast])

  const editorView = useMemo(() => {
    if (!activeGeneration) return null

    const files = Object.keys(extractFilesFromCode(activeGeneration.code || ""))

    return (
      <div className="flex h-screen bg-black relative overflow-hidden">
        <StarsBackground className="z-0" starDensity={0.00015} />
        <ShootingStars className="z-0" starColor="#9E00FF" trailColor="#2EBDF" />

        {/* Chat Sidebar */}
        <div className="w-96 flex-shrink-0 bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-800 flex flex-col relative z-10">
          <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToDashboard}
              className="text-neutral-400 hover:text-white hover:bg-neutral-800 h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img src="/images/wexar-logo-new.png" alt="Wexar" className="h-6 w-auto" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeGeneration.messages?.map((msg, idx) => (
              <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg p-3 text-sm",
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-200",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg p-3 bg-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 pb-6">
            <div className="relative rounded-3xl border border-neutral-700 bg-neutral-900/90 backdrop-blur-sm shadow-lg">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleTextareaKeyDown} // Use handleTextareaKeyDown instead of handleSubmit
                placeholder="Continue editing..."
                disabled={isGenerating}
                className={cn(
                  "w-full px-4 py-3 resize-none border-none",
                  "bg-transparent text-white text-sm",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-neutral-500",
                )}
                style={{ overflow: "hidden" }}
              />

              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1">
                  <input
                    ref={editorFileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editorFileInputRef.current?.click()}
                    className="h-8 w-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                    title="Adicionar arquivo"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleElementSelect}
                    className={cn(
                      "h-8 w-8 rounded-lg",
                      isElementSelectMode
                        ? "bg-blue-600 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800",
                    )}
                    title="Selecionar elemento para editar"
                  >
                    <MousePointer2 className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  disabled={!prompt.trim() || isGenerating}
                  onClick={onSubmit}
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    prompt.trim() && !isGenerating
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-neutral-800 text-neutral-600",
                  )}
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Toolbar */}
          <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4">
            {/* Left section - Logo and project name */}

            {/* Center section - View controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTab("preview")}
                className={cn(
                  "h-8 w-8 rounded-lg",
                  selectedTab === "preview"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800",
                )}
                title="Preview"
                disabled={!hasCode}
              >
                <Eye className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTab("code")}
                className={cn(
                  "h-8 w-8 rounded-lg",
                  selectedTab === "code"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800",
                )}
                title="Code"
                disabled={!hasCode}
              >
                <Code2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDevicePreview}
                className={cn(
                  "h-8 w-8 rounded-lg",
                  deviceMode !== "desktop"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800",
                )}
                title={`Device: ${deviceMode}`}
                disabled={!hasCode}
              >
                {deviceMode === "desktop" && <Monitor className="w-4 h-4" />}
                {deviceMode === "tablet" && <Tablet className="w-4 h-4" />}
                {deviceMode === "mobile" && <Smartphone className="w-4 h-4" />}
              </Button>
            </div>

            {/* Center search bar */}
            <div className="flex-1 max-w-md mx-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Rotas do site..."
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => setShowRoutes(detectedRoutes.length > 1)}
                  onBlur={() => setTimeout(() => setShowRoutes(false), 200)}
                  className="w-full h-8 bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 text-sm text-neutral-400 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
                />
              </div>

              {showRoutes && detectedRoutes.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="py-1">
                    {detectedRoutes
                      .filter((route) => route.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((route, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigateToRoute(route)}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <span className="text-neutral-500">{route.startsWith("#") ? "🔗" : "📄"}</span>
                          <span>{route}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={!hasCode}
                className="h-8 w-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenInNewTab}
                disabled={!hasCode}
                className="h-8 w-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-neutral-800 mx-2" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleGithubPush}
                disabled={!hasCode}
                className="h-8 w-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                title="Push to GitHub"
              >
                <Github className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                onClick={handleShare}
                disabled={!activeGeneration}
                className="h-8 px-3 text-sm bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Share
              </Button>

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={!activeGeneration}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Publish
              </Button>
            </div>
          </div>

          {publishedUrl && (
            <div className="border-t border-neutral-800 bg-neutral-900/50 px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400">Site publicado:</span>
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-400 underline truncate flex-1"
                >
                  {publishedUrl}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(publishedUrl)
                    toast({ title: "Link copiado!" })
                  }}
                  className="text-neutral-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Preview/Code Content */}
          <div className="flex-1 bg-neutral-950 relative overflow-hidden">
            {selectedTab === "preview" && (
              <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                {!hasCode && isGenerating ? (
                  <div className="flex flex-col items-center gap-4 text-neutral-400">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                    <p className="text-lg">Gerando seu site...</p>
                  </div>
                ) : !hasCode ? (
                  <div className="flex flex-col items-center gap-4 text-neutral-400">
                    <Monitor className="w-16 h-16" />
                    <p className="text-lg">Nenhum código para visualizar</p>
                    <p className="text-sm">Descreva o site que você deseja criar</p>
                  </div>
                ) : (
                  <div
                    style={{
                      width: deviceMode === "desktop" ? "100%" : deviceMode === "tablet" ? "768px" : "375px",
                      height: "100%",
                      minWidth: 0,
                      maxWidth: "100%",
                      transition: "width 0.3s ease",
                    }}
                    className="relative rounded-lg overflow-hidden shadow-2xl border border-neutral-800 bg-white"
                  >
                    <iframe
                      ref={iframeRef}
                      srcDoc={activeGeneration.code}
                      className="w-full h-full bg-white"
                      title="Website Preview"
                      sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                      onLoad={() => console.log("[v0] Iframe loaded successfully")}
                      onError={() => console.error("[v0] Iframe load error")}
                    />
                  </div>
                )}
              </div>
            )}

            {selectedTab === "code" && (
              <div className="h-full flex">
                {/* File Explorer Sidebar */}
                <div className="w-64 bg-[#1e1e1e] border-r border-neutral-800 flex flex-col">
                  <div className="px-3 py-2 border-b border-neutral-800">
                    <div className="text-xs font-semibold text-neutral-400 uppercase">Explorer</div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    {Object.entries(fileStructure).map(([folder, files]) => (
                      <div key={folder}>
                        <button
                          onClick={() => toggleFolder(folder)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 text-sm"
                        >
                          {expandedFolders.has(folder) ? (
                            <FolderOpen className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Folder className="w-4 h-4 text-blue-400" />
                          )}
                          <span>{folder === "/" ? "Root" : folder}</span>
                        </button>

                        {expandedFolders.has(folder) && (
                          <div className="ml-2">
                            {files.map((file) => (
                              <div
                                key={file}
                                className={`flex items-center justify-between group px-3 py-1.5 hover:bg-neutral-800 ${
                                  selectedFile === file ? "bg-neutral-800" : ""
                                }`}
                              >
                                <button
                                  onClick={() => setSelectedFile(file)}
                                  className={`flex items-center gap-2 text-sm flex-1 text-left ${
                                    selectedFile === file ? "text-white" : "text-neutral-400"
                                  }`}
                                >
                                  <File className="w-4 h-4" />
                                  <span>{file}</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const content = extractFilesFromCode(activeGeneration?.code || "")[file] || ""
                                    downloadFile(file, content)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-700 rounded transition-opacity"
                                  title={`Download ${file}`}
                                >
                                  <Download className="w-3.5 h-3.5 text-neutral-400 hover:text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Content Area */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                  {/* File Tab */}
                  {selectedFile && (
                    <div className="border-b border-neutral-800 flex items-center">
                      <div className="px-4 py-2 bg-[#1e1e1e] border-r border-neutral-800 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-300">{selectedFile}</span>
                      </div>
                    </div>
                  )}

                  {/* Code Display */}
                  <div className="flex-1 overflow-auto">
                    {selectedFile && extractFilesFromCode(activeGeneration.code || "")[selectedFile] ? (
                      <pre className="p-4 text-sm leading-relaxed text-neutral-300 font-mono">
                        <code>{extractFilesFromCode(activeGeneration.code || "")[selectedFile]}</code>
                      </pre>
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-500">
                        <div className="text-center">
                          <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Selecione um arquivo para visualizar</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }, [
    activeGeneration,
    selectedTab,
    deviceMode,
    isGenerating,
    handleDevicePreview,
    handleRefresh,
    handleOpenInNewTab,
    handleShare,
    handlePublish,
    handleGithubPush,
    searchQuery,
    detectedRoutes,
    showRoutes,
    handleNavigateToRoute,
    prompt,
    onPromptChange,
    onSubmit,
    adjustHeight,
    textareaRef,
    editorFileInputRef,
    handleFileUpload,
    handleElementSelect,
    isElementSelectMode,
    selectedFile,
    fileStructure,
    expandedFolders,
    toggleFolder,
    downloadFile,
    extractFilesFromCode,
    messages,
    projectName,
    selectedModel,
    createProject,
    updateProjectHook,
    toast,
    onBackToDashboard,
    isTyping, // Include isTyping here
  ])

  const projectsView = useMemo(() => {
    if (!showProjects) return null

    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onCloseProjects} />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col pointer-events-auto">
            {/* Header */}
            <div className="h-16 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between px-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCloseProjects}
                  className="text-neutral-400 hover:text-white hover:bg-neutral-800 h-8 w-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-white font-semibold text-lg">Meus Projetos</h2>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="flex-1 overflow-y-auto p-8">
              {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject?.(project)}
                      className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all cursor-pointer"
                    >
                      {/* Preview */}
                      <div className="aspect-video bg-neutral-900 border-b border-neutral-800 overflow-hidden">
                        <iframe
                          srcDoc={project.code}
                          title={project.title}
                          className="w-full h-full border-none pointer-events-none scale-50 origin-top-left"
                          style={{ width: "200%", height: "200%" }}
                          sandbox="allow-same-origin"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-white truncate">{project.title || "Untitled"}</h3>
                        <p className="text-neutral-400 text-xs mb-2 line-clamp-2">
                          {project.description || "Sem descrição"}
                        </p>
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span>{new Date(project.timestamp).toLocaleDateString()}</span>
                          <span>{project.editCount} edits</span>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors pointer-events-none" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                    <Code2 className="w-8 h-8 text-neutral-600" />
                  </div>
                  <h3 className="text-white text-lg font-medium mb-2">Nenhum projeto ainda</h3>
                  <p className="text-neutral-400 text-sm mb-6">Comece a criar seu primeiro site com IA</p>
                  <Button onClick={onCloseProjects} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                    Criar Novo Projeto
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }, [showProjects, projects, onCloseProjects, onSelectProject])

  const handleGenerate = useCallback(
    async (userPrompt: string, currentCode?: string) => {
      console.log("[v0] Generate request received:", {
        promptLength: userPrompt.length,
        hasCurrentCode: !!currentCode,
        historyLength: messages.length,
      })

      if (!userPrompt || userPrompt.trim().length === 0) {
        return
      }

      if (userPrompt.trim().length < 3) {
        return
      }

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userPrompt,
            currentCode,
            history: messages,
            model: selectedModel,
          }),
        })

        if (!response.ok) {
          let errorMessage = "Generation failed"
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch (parseError) {
            console.error("[v0] Failed to parse error response:", parseError)
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        const { code, explanation } = await response.json()

        console.log("[v0] Generation response received:", {
          hasCode: !!code,
          codeLength: code?.length,
          explanation,
        })

        const newGeneration: Generation = {
          id: activeGeneration?.id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userPrompt,
          code,
          timestamp: new Date(),
          editCount: (activeGeneration?.editCount || 0) + 1,
          title: projectName || "Untitled Project",
          description: userPrompt.slice(0, 100),
          isFavorite: activeGeneration?.isFavorite || false,
          messages: [
            ...messages,
            { role: "user", content: userPrompt },
            { role: "assistant", content: explanation || "Site criado!" },
          ],
        }

        try {
          if (activeGeneration?.id) {
            console.log("[v0] Updating existing project:", activeGeneration.id)
            await updateProjectHook(activeGeneration.id, {
              code,
              updatedAt: new Date().toISOString(),
              editCount: newGeneration.editCount,
            })
          } else {
            console.log("[v0] Creating new project")
            await createProject({
              id: newGeneration.id,
              name: newGeneration.title,
              description: newGeneration.description,
              code,
              timestamp: new Date().toISOString(),
              editCount: 1,
              title: newGeneration.title,
              userId: "default-user",
              framework: "react",
              status: "active",
            })
          }
          console.log("[v0] Project saved successfully")
        } catch (saveError) {
          console.error("[v0] Error saving project:", saveError)
          // Continue anyway to show the generated code
        }

        setMessages(newGeneration.messages || [])

        toast({
          title: "Site criado!",
          description: explanation || "Seu site está pronto para visualização.",
        })

        return newGeneration
      } catch (error) {
        console.error("[v0] Error generating website:", {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          type: typeof error,
        })

        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido. Tente novamente."

        toast({
          title: "Erro ao gerar site",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      }
    },
    [messages, activeGeneration, projectName, selectedModel, createProject, updateProjectHook, toast],
  )

  // The onSubmit function needs to call handleGenerate
  const handleSubmit = useCallback(() => {
    if (!prompt.trim() || isGenerating) return
    console.log("[v0] Submit triggered, calling onSubmit")
    // In the main page, onSubmit is used to trigger the generation,
    // so we need to call handleGenerate here.
    // If activeGeneration exists, we pass its code as currentCode.
    // Otherwise, it's a new generation.
    handleGenerate(prompt, activeGeneration?.code)
    // The original onSubmit was likely just to trigger generation,
    // now we are directly calling handleGenerate. If onSubmit has other purposes
    // in the parent component, they need to be handled differently.
    // For now, we assume onSubmit's main purpose here is to initiate generation.
  }, [prompt, isGenerating, handleGenerate, activeGeneration?.code])

  const handleSubmitForChat = useCallback(() => {
    if (prompt.trim().length >= 3 && !isGenerating && !isSubmitting) {
      console.log("[v0] Submit triggered, calling onSubmit")
      setIsSubmitting(true)
      onSubmit()
      setTimeout(() => setIsSubmitting(false), 1000)
    }
  }, [prompt, isGenerating, isSubmitting, onSubmit])

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-black via-neutral-950 to-black">
      {projectsView}
      {editorView || (
        <div className="relative flex-1 flex flex-col">
          {/* Stars Background */}
          <StarsBackground className="absolute inset-0 z-0" starDensity={0.00015} />
          <ShootingStars className="absolute inset-0 z-0" starColor="#9E00FF" trailColor="#2EBDF" />

          <div className="absolute top-3 left-6 z-20">
            <img src="/images/wexar-logo-new.png" alt="Wexar" className="h-8 w-auto" />
          </div>

          <header className="bg-transparent px-6 py-3 flex items-center justify-between relative z-10 w-full max-w-7xl mx-auto shrink-0">
            <div className="flex items-center gap-2">
              {/* Logo removed from here - now positioned absolutely in corner */}
            </div>

            {/* Start of Updates */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-6 pt-1">
              <button onClick={onShowProjects} className="text-neutral-300 hover:text-white text-sm transition-colors">
                {t("projects")}
              </button>
              <button
                onClick={() => setShowPricingPopup(true)}
                className="text-neutral-300 hover:text-white text-sm transition-colors"
              >
                {t("pricing")}
              </button>
            </div>
            {/* End of Updates */}

            {/* Social Icons Button Section */}
          </header>

          <div className="absolute inset-0 top-0 bottom-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
            {/* Title */}
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto">
                {t("heroTitle")} <span className="italic text-white">{t("heroTitleItalic")}</span> {t("heroTitleEnd")}
              </h1>
              <p className="mt-4 text-lg text-neutral-300">{t("heroSubtitle")}</p>
            </div>

            {/* Bolt-style prompt card */}
            <div className="w-full max-w-3xl mx-auto space-y-4">
              <div className="relative bg-neutral-900/90 backdrop-blur-xl rounded-2xl border border-neutral-800/60 shadow-2xl overflow-hidden">
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handlePromptChange}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder={t("placeholder")}
                  disabled={isGenerating}
                  className={cn(
                    "w-full px-5 py-4 resize-none border-none",
                    "bg-transparent text-white text-base",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                    "placeholder:text-neutral-500 min-h-[60px]",
                    isGenerating && "opacity-50",
                  )}
                  style={{ overflow: "hidden" }}
                />

                {/* Bolt-style bottom toolbar */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 w-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                      title="Adicionar arquivos"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Added isSubmitting check */}
                  <Button
                    disabled={!prompt.trim() || isGenerating || isSubmitting}
                    onClick={handleSubmitForChat}
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-lg transition-all duration-300",
                      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50",
                      (!prompt.trim() || isGenerating || isSubmitting) && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-left fixed sidebar with profile and menu toggle */}
          <div className="fixed bottom-0 left-0 z-50 flex flex-col items-center gap-2 p-3">
            {/* User Profile Avatar */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-sm hover:bg-teal-600 transition-colors shadow-lg"
              title="Profile Menu"
            >
              Y
            </button>

            {/* Menu/Tabs Toggle Button */}
            <button
              className="w-8 h-8 rounded-lg bg-transparent backdrop-blur-sm flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-700/30 transition-colors border border-neutral-700/30"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Toggle Menu"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowProfileMenu(false)} />

              {/* Sidebar Menu */}
              <div className="fixed left-0 top-0 bottom-0 w-[350px] bg-neutral-950 border-r border-neutral-800 z-[70] flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <img src="/images/wexar-logo-new.png" alt="Wexar" className="h-8 w-auto" />
                  </div>
                </div>

                {/* Start new chat button */}
                <div className="p-4">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      onPromptChange("")
                      // Clear active generation and messages when starting a new chat
                      // This assumes that onBackToDashboard also handles this state reset
                      // If not, you might need to explicitly clear activeGeneration and messages here
                      if (onBackToDashboard) onBackToDashboard()
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Novo chat
                  </button>
                </div>

                {/* Search */}
                <div className="px-4 pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar"
                      className="w-full h-9 bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700"
                    />
                  </div>
                </div>

                {/* Projetos Recentes */}
                <div className="flex-1 overflow-y-auto px-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-neutral-400">{t("recentProjects")}</div>
                  </div>

                  {projects && projects.length > 0 ? (
                    <div className="space-y-1 mb-4">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setShowProfileMenu(false)
                            if (onSelectProject) onSelectProject(project)
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-900 text-sm text-neutral-300 hover:text-white transition-colors truncate"
                        >
                          {project.title || project.name || "Projeto sem nome"}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-3">
                        <MessageCircle className="w-6 h-6 text-neutral-600" />
                      </div>
                      <p className="text-sm text-neutral-500 mb-1">{t("noProjects")}</p>
                      <p className="text-xs text-neutral-600">{t("startChat")}</p>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="border-t border-neutral-800 p-2">
                    <button
                      onClick={() => {
                        setShowTokensModal(true)
                        setShowProfileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-900 text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-green-500" />
                      {t("tokens")}
                    </button>

                    <button
                      onClick={() => {
                        setShowSettingsModal(true)
                        setShowProfileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-900 text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {t("settings")}
                    </button>

                    <button
                      onClick={() => {
                        setShowPricingPopup(true)
                        setShowProfileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-900 text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      {t("pricing")}
                    </button>

                    <button
                      onClick={() => {
                        setShowAccountModal(true)
                        setShowProfileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-900 text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Conta
                    </button>

                    <button
                      onClick={() => {
                        setShowHelpCenterModal(true)
                        setShowProfileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-900 text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Ajuda
                    </button>
                  </div>
                </div>

                {/* Logout at bottom */}
                <div className="p-4 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      if (confirm("Tem certeza que deseja sair?")) {
                        setShowProfileMenu(false)
                        alert("Logout efetuado com sucesso!")
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-900 text-sm text-neutral-300 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Pricing Popup */}
          {showPricingPopup && <PricingPopup isOpen={showPricingPopup} onClose={() => setShowPricingPopup(false)} />}

          {/* Settings Modal */}
          {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}

          {/* Tokens Modal */}
          {showTokensModal && <TokensModal onClose={() => setShowTokensModal(false)} />}

          {/* Account Modal */}
          {showAccountModal && <AccountModal onClose={() => setShowAccountModal(false)} />}

          {showHelpCenterModal && (
            <HelpCenterModal isOpen={showHelpCenterModal} onClose={() => setShowHelpCenterModal(false)} />
          )}

          {/* Figma Import Modal */}
          <FigmaImportModal
            isOpen={showFigmaImportModal}
            onClose={() => setShowFigmaImportModal(false)}
            onImport={(importedPrompt) => {
              onPromptChange(importedPrompt)
              setShowFigmaImportModal(false)
            }}
          />

          {/* GitHub Import Modal */}
          <GithubImportModal
            isOpen={showGithubImportModal}
            onClose={() => setShowGithubImportModal(false)}
            onImport={(importedPrompt) => {
              onPromptChange(importedPrompt)
              setShowGithubImportModal(false)
            }}
          />
        </div>
      )}
      {!activeGeneration && (
        <footer className="fixed bottom-0 left-0 right-0 z-10 py-3 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-neutral-500 text-center">© 2026 Wexar. Todos os direitos reservados.</p>
          </div>
        </footer>
      )}
    </div>
  )
}
