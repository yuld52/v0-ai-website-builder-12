"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Link2, Mail, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  projectId: string
  projectTitle: string
}

export function ShareDialog({ projectId, projectTitle }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/project/${projectId}`

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Link copiado!",
      description: "O link do projeto foi copiado para a área de transferência.",
    })
  }

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(projectTitle)}&body=${encodeURIComponent(`Confira este projeto: ${shareUrl}`)}`
  }

  return (
    null
  )
}
