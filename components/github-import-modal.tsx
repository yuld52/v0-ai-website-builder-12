"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Github, Loader2, ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GithubImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (prompt: string) => void
}

export function GithubImportModal({ isOpen, onClose, onImport }: GithubImportModalProps) {
  const [githubUrl, setGithubUrl] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  if (!isOpen) return null

  const handleConnect = () => {
    if (accessToken.trim()) {
      setIsConnected(true)
    }
  }

  const handleImport = async () => {
    if (!githubUrl.trim()) return

    setIsImporting(true)
    try {
      const response = await fetch("/api/import/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl, accessToken }),
      })

      if (!response.ok) throw new Error("Failed to import")

      const data = await response.json()
      onImport(data.prompt)
      onClose()
    } catch (error) {
      console.error("[v0] GitHub import error:", error)
      alert("Erro ao importar do GitHub. Verifique a URL e tente novamente.")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-neutral-400 hover:text-white hover:bg-neutral-800 z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Importar do GitHub</h2>
              <p className="text-sm text-neutral-400">Conecte sua conta GitHub e importe repositórios</p>
            </div>
          </div>

          <Tabs defaultValue="connect" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="connect">Conectar</TabsTrigger>
              <TabsTrigger value="import" disabled={!isConnected}>
                Importar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connect" className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Token de Acesso do GitHub</label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxx"
                  className="w-full h-10 bg-neutral-950 border border-neutral-800 rounded-lg px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Obtenha seu token em{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    Configurações do GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Como obter seu token:</h4>
                <ol className="text-xs text-neutral-400 space-y-1 list-decimal list-inside">
                  <li>Acesse GitHub Settings → Developer settings</li>
                  <li>Clique em "Personal access tokens" → "Tokens (classic)"</li>
                  <li>Clique em "Generate new token (classic)"</li>
                  <li>Selecione os scopes: repo, read:user</li>
                  <li>Copie e cole o token acima</li>
                </ol>
              </div>

              <Button
                onClick={handleConnect}
                disabled={!accessToken.trim() || isConnected}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                {isConnected ? "Conectado!" : "Conectar ao GitHub"}
              </Button>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">URL do Repositório</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full h-10 bg-neutral-950 border border-neutral-800 rounded-lg px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Cole a URL completa do repositório GitHub que deseja importar
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">O que será importado:</h4>
                <ul className="text-xs text-neutral-400 space-y-1">
                  <li>• Estrutura de arquivos e pastas</li>
                  <li>• Código fonte (HTML, CSS, JS)</li>
                  <li>• Configurações e dependências</li>
                  <li>• README e documentação</li>
                </ul>
              </div>

              <Button
                onClick={handleImport}
                disabled={!githubUrl.trim() || isImporting}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  "Importar Repositório"
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
