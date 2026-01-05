"use client"

import { Button } from "@/components/ui/button"
import { Wand2 } from "lucide-react"

interface CodeFormatterProps {
  code: string
  onFormat: (formattedCode: string) => void
}

export function CodeFormatter({ code, onFormat }: CodeFormatterProps) {
  const formatHTML = (html: string): string => {
    let formatted = ""
    let indent = 0
    const tab = "  "

    html.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) indent--
      formatted += tab.repeat(indent) + "<" + node + ">\n"
      if (node.match(/^<?\w[^>]*[^/]$/) && !node.startsWith("input") && !node.startsWith("br")) indent++
    })

    return formatted
      .substring(1, formatted.length - 2)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n")
  }

  const handleFormat = () => {
    try {
      const formatted = formatHTML(code)
      onFormat(formatted)
    } catch (error) {
      console.error("Error formatting code:", error)
    }
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleFormat} className="gap-2 text-white/70 hover:text-white">
      <Wand2 className="w-4 h-4" />
      Formatar
    </Button>
  )
}
