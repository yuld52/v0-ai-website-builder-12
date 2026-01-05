"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Gift, Share2, UserPlus, Calendar, TrendingUp, Copy, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface TokensModalProps {
  onClose: () => void
}

export function TokensModal({ onClose }: TokensModalProps) {
  const { toast } = useToast()
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [claimedTasks, setClaimedTasks] = useState<number[]>([])

  const handleClaimTask = (taskIndex: number, tokens: number, title: string) => {
    if (claimedTasks.includes(taskIndex)) {
      toast({
        title: "Já Reivindicado",
        description: "Você já reivindicou esta recompensa",
        variant: "destructive",
      })
      return
    }

    setClaimedTasks([...claimedTasks, taskIndex])
    toast({
      title: "Tokens Ganhos!",
      description: `Você ganhou ${tokens} tokens por ${title}`,
    })
  }

  const handleCopyReferral = () => {
    navigator.clipboard.writeText("https://wexar.ai/ref/USER123")
    setCopiedReferral(true)
    toast({
      title: "Link Copiado!",
      description: "Link de referência copiado para a área de transferência",
    })
    setTimeout(() => setCopiedReferral(false), 2000)
  }

  const tasks = [
    {
      icon: Calendar,
      title: "Check-in Diário",
      description: "Visite o Wexar AI diariamente para reivindicar seus tokens bônus",
      tokens: 10,
      color: "orange",
      frequency: "Diário",
    },
    {
      icon: Share2,
      title: "Compartilhar nas Redes Sociais",
      description: "Compartilhe o Wexar AI no Twitter, LinkedIn ou Facebook",
      tokens: 100,
      color: "blue",
      frequency: "Uma vez por plataforma",
    },
    {
      icon: UserPlus,
      title: "Indique um Amigo",
      description: "Convide amigos e ganhe tokens quando eles se cadastrarem e criarem seu primeiro projeto",
      tokens: 200,
      color: "purple",
      frequency: "Por indicação",
    },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ganhe Tokens Grátis</h2>
              <p className="text-sm text-neutral-400">
                Complete tarefas para ganhar tokens e desbloquear recursos premium
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="earn" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start border-b border-neutral-800 rounded-none bg-transparent p-0 h-auto">
            <TabsTrigger
              value="earn"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-6 py-4 font-semibold"
            >
              <Gift className="w-4 h-4 mr-2" />
              Ganhar Tokens
            </TabsTrigger>
            <TabsTrigger
              value="balance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-6 py-4 font-semibold"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Saldo
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-6 py-4 font-semibold"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsContent value="earn" className="p-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task, idx) => {
                  const isClaimed = claimedTasks.includes(idx)
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl border ${
                        isClaimed
                          ? "border-neutral-800 bg-neutral-950/50 opacity-60"
                          : "border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-950 hover:border-neutral-600"
                      } transition-all group`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-12 h-12 rounded-lg bg-${task.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            <task.icon className={`w-6 h-6 text-${task.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-white">{task.title}</h3>
                              {isClaimed && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                  Reivindicado
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-400 leading-relaxed">{task.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs font-medium text-neutral-500 px-2 py-1 bg-neutral-800/50 rounded">
                                {task.frequency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                            +{task.tokens}
                          </div>
                          <span className="text-xs text-neutral-500">tokens</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleClaimTask(idx, task.tokens, task.title)}
                          disabled={isClaimed}
                          className={`${
                            isClaimed
                              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
                          } h-9 px-4 font-semibold shadow-lg`}
                        >
                          {isClaimed ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Reivindicado
                            </>
                          ) : (
                            "Reivindicar Agora"
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Programa de Indicação</h3>
                    <p className="text-sm text-neutral-400 mb-4">
                      Compartilhe seu link único de indicação e ganhe 200 tokens para cada amigo que se cadastrar e
                      criar seu primeiro projeto!
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="https://wexar.ai/ref/USER123"
                        readOnly
                        className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <Button onClick={handleCopyReferral} className="bg-purple-500 hover:bg-purple-600 text-white">
                        {copiedReferral ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="balance" className="p-6 m-0">
              <div className="text-center py-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 opacity-20 animate-pulse"></div>
                  <Gift className="w-16 h-16 text-emerald-400 relative z-10" />
                </div>
                <h3 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  1.250
                </h3>
                <p className="text-neutral-400 mb-8">Tokens Disponíveis</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                    <div className="text-3xl font-bold text-white mb-2">350</div>
                    <div className="text-sm text-neutral-400 font-medium">Total Ganho</div>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30">
                    <div className="text-3xl font-bold text-white mb-2">150</div>
                    <div className="text-sm text-neutral-400 font-medium">Total Usado</div>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                    <div className="text-3xl font-bold text-white mb-2">900</div>
                    <div className="text-sm text-neutral-400 font-medium">Comprado</div>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto">
                  <h4 className="text-lg font-semibold text-white mb-4">Como Você Pode Usar Tokens</h4>
                  <div className="space-y-3 text-left">
                    {[
                      { feature: "Gerar Website", cost: 10, icon: "🌐" },
                      { feature: "Acesso a Templates Premium", cost: 50, icon: "⭐" },
                      { feature: "Suporte Prioritário", cost: 100, icon: "💬" },
                      { feature: "Modelos de IA Avançados", cost: 20, icon: "🤖" },
                      { feature: "Remover Marca D'água", cost: 200, icon: "✨" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg bg-neutral-900 border border-neutral-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-sm font-medium text-white">{item.feature}</span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-400">{item.cost} tokens</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6 m-0">
              <div className="space-y-3">
                {[
                  {
                    action: "Indicou um amigo (João Silva)",
                    tokens: 200,
                    date: "há 2 dias",
                    type: "earn",
                    icon: UserPlus,
                  },
                  {
                    action: "Gerou website de e-commerce",
                    tokens: -10,
                    date: "há 3 dias",
                    type: "spend",
                    icon: Gift,
                  },
                  { action: "Compartilhou no Twitter", tokens: 100, date: "há 1 semana", type: "earn", icon: Share2 },
                  { action: "Gerou website de portfolio", tokens: -10, date: "há 1 semana", type: "spend", icon: Gift },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${item.type === "earn" ? "bg-green-500/20" : "bg-red-500/20"} flex items-center justify-center`}
                      >
                        <item.icon className={`w-5 h-5 ${item.type === "earn" ? "text-green-400" : "text-red-400"}`} />
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium group-hover:text-emerald-400 transition-colors">
                          {item.action}
                        </div>
                        <div className="text-xs text-neutral-500">{item.date}</div>
                      </div>
                    </div>
                    <div className={`text-base font-bold ${item.type === "earn" ? "text-green-400" : "text-red-400"}`}>
                      {item.tokens > 0 ? "+" : ""}
                      {item.tokens}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
