"use client"

import { Button } from "@/components/ui/button"
import { Clock, RotateCcw } from "lucide-react"

interface ProjectVersion {
  id: string
  code: string
  timestamp: Date
  description: string
}

interface VersionHistoryProps {
  versions: ProjectVersion[]
  onRestore: (versionId: string) => void
}

export function VersionHistory({ versions, onRestore }: VersionHistoryProps) {
  if (!versions || versions.length === 0) {
    return (
      <div className="p-4 text-center">
        <Clock className="w-8 h-8 mx-auto text-white/30 mb-2" />
        <p className="text-white/50 text-sm">Nenhuma versão salva ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {versions.map((version, idx) => (
        <div
          key={version.id}
          className="bg-[#2a2a2a] border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-white/70">v{versions.length - idx}</span>
                <span className="text-xs text-white/50">{new Date(version.timestamp).toLocaleString("pt-BR")}</span>
              </div>
              <p className="text-sm text-white">{version.description}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRestore(version.id)}
              className="text-white/70 hover:text-white shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
