"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, Tablet, Loader2 } from "lucide-react"

interface ResponsivePreviewProps {
  code: string
}

export function ResponsivePreview({ code }: ResponsivePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const deviceSizes = {
    desktop: "w-full h-full",
    tablet: "w-[768px] h-[1024px] mx-auto",
    mobile: "w-[375px] h-[667px] mx-auto",
  }

  const handleIframeLoad = useCallback(() => {
    console.log("[v0] ResponsivePreview iframe loaded")
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (code && iframeRef.current) {
      setIsLoading(true)
      // Force clean reload
      iframeRef.current.srcdoc = ""
      requestAnimationFrame(() => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = code
        }
      })
    }
  }, [code])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] border-b border-white/10">
        <Button
          size="sm"
          variant={device === "desktop" ? "default" : "ghost"}
          onClick={() => setDevice("desktop")}
          className="gap-2"
        >
          <Monitor className="w-4 h-4" />
          Computador
        </Button>
        <Button
          size="sm"
          variant={device === "tablet" ? "default" : "ghost"}
          onClick={() => setDevice("tablet")}
          className="gap-2"
        >
          <Tablet className="w-4 h-4" />
          Tablet
        </Button>
        <Button
          size="sm"
          variant={device === "mobile" ? "default" : "ghost"}
          onClick={() => setDevice("mobile")}
          className="gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Celular
        </Button>

        {isLoading && (
          <div className="ml-auto flex items-center gap-2 text-white/60 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Carregando...</span>
          </div>
        )}
      </div>

      <div className="flex-1 bg-[#0f0f0f] p-4 overflow-auto">
        <div
          className={`${deviceSizes[device]} transition-all duration-300 border border-white/10 rounded-lg overflow-hidden shadow-2xl relative`}
        >
          {isLoading && code && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-neutral-600">Carregando preview...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={code}
            className="w-full h-full bg-white"
            title="Preview"
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
            onLoad={handleIframeLoad}
            onError={() => {
              console.error("[v0] ResponsivePreview iframe error")
              setIsLoading(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}
