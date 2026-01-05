"use client"

import { useState, useEffect } from "react"
import { Terminal, X, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConsoleMessage {
  type: "error" | "warning" | "info"
  message: string
  timestamp: Date
}

interface ConsolePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ConsolePanel({ isOpen, onClose }: ConsolePanelProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([])

  useEffect(() => {
    if (!isOpen) return

    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalConsoleLog = console.log

    console.error = (...args) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          message: args.join(" "),
          timestamp: new Date(),
        },
      ])
      originalConsoleError(...args)
    }

    console.warn = (...args) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "warning",
          message: args.join(" "),
          timestamp: new Date(),
        },
      ])
      originalConsoleWarn(...args)
    }

    console.log = (...args) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "info",
          message: args.join(" "),
          timestamp: new Date(),
        },
      ])
      originalConsoleLog(...args)
    }

    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      console.log = originalConsoleLog
    }
  }, [isOpen])

  if (!isOpen) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 z-50"
      style={{ height: "250px" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white/70" />
          <span className="text-sm text-white font-medium">Console</span>
          <span className="text-xs text-white/50">({messages.length} mensagens)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMessages([])}
            className="text-white/70 hover:text-white text-xs h-7"
          >
            Limpar
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} className="text-white/70 hover:text-white h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100%-40px)] p-2 space-y-1 font-mono text-xs">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/30">Nenhuma mensagem no console</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="flex items-start gap-2 px-2 py-1 hover:bg-white/5 rounded">
              {getIcon(msg.type)}
              <span className="text-white/70 shrink-0 text-[10px]">{msg.timestamp.toLocaleTimeString("pt-BR")}</span>
              <span
                className={`flex-1 ${
                  msg.type === "error" ? "text-red-400" : msg.type === "warning" ? "text-yellow-400" : "text-white/70"
                }`}
              >
                {msg.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
