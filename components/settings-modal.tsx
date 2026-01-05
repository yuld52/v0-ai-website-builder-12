"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Sliders, Globe, Bell, Shield, Download, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wexar-settings")
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          return settings.language || "pt"
        } catch {
          return "pt"
        }
      }
    }
    return "pt"
  })
  const [autoSave, setAutoSave] = useState(true)
  const [codeCompletion, setCodeCompletion] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const { toast } = useToast()

  const handleSave = () => {
    localStorage.setItem(
      "wexar-settings",
      JSON.stringify({
        language,
        autoSave,
        codeCompletion,
        analytics,
        notifications,
      }),
    )
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso",
    })

    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const handleExportData = () => {
    const data = localStorage.getItem("wexar-projects")
    const blob = new Blob([data || ""], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wexar-backup-${Date.now()}.json`
    a.click()
    toast({
      title: "Dados exportados",
      description: "Seus projetos foram baixados",
    })
  }

  const handleClearData = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      localStorage.clear()
      toast({
        title: "Dados limpos",
        description: "Todos os dados locais foram removidos",
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 rounded-2xl border border-neutral-800 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div>
            <h2 className="text-xl font-semibold text-white">Configurações</h2>
            <p className="text-sm text-neutral-400 mt-1">Personalize sua experiência no Wexar AI</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="preferences" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start border-b border-neutral-800 rounded-none bg-transparent p-0 h-auto">
            <TabsTrigger
              value="preferences"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-3 text-neutral-400 data-[state=active]:text-white"
            >
              <Sliders className="w-4 h-4 mr-2" />
              Preferências
            </TabsTrigger>
            <TabsTrigger
              value="language"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-3 text-neutral-400 data-[state=active]:text-white"
            >
              <Globe className="w-4 h-4 mr-2" />
              Idioma
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-3 text-neutral-400 data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Dados & Privacidade
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="p-6 m-0">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <div>
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Download className="w-4 h-4 text-blue-400" />
                        Salva Automática
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Salva automaticamente seu trabalho a cada 30 segundos
                      </p>
                    </div>
                    <button
                      onClick={() => setAutoSave(!autoSave)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        autoSave ? "bg-blue-600" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          autoSave ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <div>
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-green-400" />
                        Completar Código
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">Ative sugestões de código com IA</p>
                    </div>
                    <button
                      onClick={() => setCodeCompletion(!codeCompletion)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        codeCompletion ? "bg-blue-600" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          codeCompletion ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <div>
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-400" />
                        Notificações
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">Receba notificações sobre atualizações e dicas</p>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        notifications ? "bg-blue-600" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notifications ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <div>
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-yellow-400" />
                        Análises
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">Ajude a melhorar o Wexar AI com dados de uso</p>
                    </div>
                    <button
                      onClick={() => setAnalytics(!analytics)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        analytics ? "bg-blue-600" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          analytics ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Language Tab */}
            <TabsContent value="language" className="p-6 m-0">
              <div className="space-y-3">
                {[
                  { code: "en", name: "English", flag: "🇺🇸" },
                  { code: "pt", name: "Português", flag: "🇵🇹" },
                  { code: "es", name: "Español", flag: "🇪🇸" },
                  { code: "fr", name: "Français", flag: "🇫🇷" },
                  { code: "de", name: "Deutsch", flag: "🇩🇪" },
                  { code: "it", name: "Italiano", flag: "🇮🇹" },
                  { code: "ja", name: "日本語", flag: "🇯🇵" },
                  { code: "ko", name: "한국어", flag: "🇰🇷" },
                  { code: "zh", name: "中文", flag: "🇨🇳" },
                  { code: "ru", name: "Русский", flag: "🇷🇺" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      language === lang.code
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-medium text-white">{lang.name}</span>
                    </div>
                    {language === lang.code && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>

            {/* Data & Privacy Tab */}
            <TabsContent value="data" className="p-6 m-0">
              <div className="space-y-6">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Seus dados são armazenados localmente no navegador e nunca são enviados para servidores externos
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleExportData}
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>

                  <Button
                    onClick={handleClearData}
                    variant="outline"
                    className="w-full justify-start border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Todos os Dados
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white">Dados Armazenados</h3>
                  <ul className="text-xs text-neutral-400 space-y-1">
                    <li>• Projetos e gerações de código</li>
                    <li>• Preferências e configurações</li>
                    <li>• Histórico de chat</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-neutral-800 bg-neutral-950/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 bg-transparent"
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  )
}
