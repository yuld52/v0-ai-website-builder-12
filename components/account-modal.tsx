"use client"

import { Button } from "@/components/ui/button"
import { X, Plus, Check, Mail, Trash2, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AccountModalProps {
  onClose: () => void
}

export function AccountModal({ onClose }: AccountModalProps) {
  const [emailToInvite, setEmailToInvite] = useState("")
  const [teamMembers, setTeamMembers] = useState<Array<{ email: string; role: string; addedAt: string }>>([])
  const { toast } = useToast()

  const handleInviteMember = () => {
    if (!emailToInvite.trim() || !emailToInvite.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      })
      return
    }

    setTeamMembers((prev) => [
      ...prev,
      {
        email: emailToInvite,
        role: "Editor",
        addedAt: new Date().toISOString(),
      },
    ])

    toast({
      title: "Membro convidado!",
      description: `Convite enviado para ${emailToInvite}`,
    })

    setEmailToInvite("")
  }

  const handleRemoveMember = (email: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.email !== email))
    toast({
      title: "Membro removido",
      description: `${email} foi removido do projeto.`,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Gerenciar Contas</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start border-b border-neutral-800 rounded-none bg-transparent p-0 h-auto">
            <TabsTrigger
              value="accounts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-3"
            >
              Suas Contas
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-3"
            >
              Equipe do Projeto
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsContent value="accounts" className="p-6 m-0">
              <div className="space-y-3">
                {[
                  {
                    email: "yuidchisslco11@gmail.com",
                    type: "Pessoal",
                    active: true,
                    avatar: "Y",
                    color: "teal",
                  },
                ].map((account, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      account.active
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-${account.color}-500 flex items-center justify-center text-white font-semibold`}
                        >
                          {account.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{account.email}</div>
                          <div className="text-xs text-neutral-400">{account.type}</div>
                        </div>
                      </div>
                      {account.active && (
                        <div className="flex items-center gap-2 text-blue-400">
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-medium">Ativa</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button className="w-full p-4 rounded-lg border-2 border-dashed border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-all">
                  <div className="flex items-center justify-center gap-2 text-neutral-400">
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-medium">Adicionar Outra Conta</span>
                  </div>
                </button>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="p-6 m-0">
              <div className="space-y-6">
                {/* Seção de convite */}
                <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Convidar Membros</h3>
                  </div>
                  <p className="text-sm text-neutral-400 mb-4">
                    Convide pessoas para colaborar neste projeto. Eles terão acesso para visualizar e editar.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Digite o email do colaborador..."
                      value={emailToInvite}
                      onChange={(e) => setEmailToInvite(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleInviteMember()}
                      className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button onClick={handleInviteMember} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Mail className="w-4 h-4 mr-2" />
                      Convidar
                    </Button>
                  </div>
                </div>

                {/* Lista de membros */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-400 mb-3">
                    Membros da Equipe ({teamMembers.length})
                  </h4>
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-12 bg-neutral-950 rounded-lg border border-neutral-800">
                      <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                      <p className="text-sm text-neutral-400">Nenhum membro ainda. Convide alguém para colaborar!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((member, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                              {member.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{member.email}</div>
                              <div className="text-xs text-neutral-400">{member.role}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.email)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
