"use client"

import { Button } from "@/components/ui/button"
import {
  X,
  MessageCircle,
  Book,
  Video,
  Mail,
  ExternalLink,
  Search,
  Sparkles,
  Code2,
  Palette,
  Globe,
  Rocket,
  HelpCircle,
  Download,
  Github,
  Share2,
  Lightbulb,
  Zap,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface HelpCenterModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filterContent = (items: any[]) => {
    if (!searchQuery.trim()) return items
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.question?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  if (!isOpen) return null

  const guides = [
    {
      icon: Sparkles,
      title: "Primeiros Passos",
      description: "Aprenda o básico sobre como usar o Wexar AI para criar websites incríveis",
      color: "blue",
      category: "Básico",
      link: "#",
    },
    {
      icon: Lightbulb,
      title: "Dicas de Prompt",
      description: "Como escrever prompts eficazes para obter os melhores resultados da IA",
      color: "yellow",
      category: "Básico",
      link: "#",
    },
    {
      icon: Video,
      title: "Tutoriais em Vídeo",
      description: "Assista tutoriais passo a passo sobre recursos avançados",
      color: "purple",
      category: "Avançado",
      link: "#",
    },
    {
      icon: Palette,
      title: "Personalização de Design",
      description: "Aprenda a personalizar cores, fontes e layouts dos seus projetos",
      color: "pink",
      category: "Design",
      link: "#",
    },
    {
      icon: Code2,
      title: "Editando Código",
      description: "Como editar e personalizar o código gerado pela IA",
      color: "green",
      category: "Avançado",
      link: "#",
    },
    {
      icon: Download,
      title: "Exportação de Projetos",
      description: "Baixe seus projetos em diferentes formatos e estruturas",
      color: "cyan",
      category: "Deploy",
      link: "#",
    },
    {
      icon: Rocket,
      title: "Deploy na Vercel",
      description: "Publique seus projetos na Vercel com um clique",
      color: "orange",
      category: "Deploy",
      link: "#",
    },
    {
      icon: Github,
      title: "Integração com GitHub",
      description: "Sincronize seus projetos com repositórios GitHub",
      color: "slate",
      category: "Deploy",
      link: "#",
    },
    {
      icon: Share2,
      title: "Compartilhamento",
      description: "Compartilhe seus projetos e colabore com outros",
      color: "indigo",
      category: "Colaboração",
      link: "#",
    },
    {
      icon: Zap,
      title: "Atalhos de Teclado",
      description: "Aumente sua produtividade com atalhos do teclado",
      color: "amber",
      category: "Produtividade",
      link: "#",
    },
  ]

  const faqs = [
    {
      question: "Como funciona o sistema de geração de websites?",
      answer:
        "O Wexar usa IA avançada para transformar suas ideias em código real. Basta descrever o que você quer, adicionar referências visuais se necessário, e a IA criará um website completo com HTML, CSS e JavaScript. Você pode então editar, personalizar e publicar.",
    },
    {
      question: "Posso exportar e usar o código em outros projetos?",
      answer:
        "Sim! Você tem total propriedade do código gerado. Pode baixar todos os arquivos (HTML, CSS, JS) e usar em qualquer projeto, hospedar onde quiser, ou integrar com frameworks como React ou Vue.",
    },
    {
      question: "Que tipos de websites posso criar?",
      answer:
        "Praticamente qualquer tipo: landing pages, portfolios, e-commerce, blogs, dashboards, aplicações web, formulários, galerias, e muito mais. A IA é treinada em milhares de designs modernos.",
    },
    {
      question: "Como posso melhorar os resultados da geração?",
      answer:
        "Seja específico nos prompts (cores, estilo, seções), use referências visuais quando possível, mencione frameworks ou bibliotecas preferidas, e itere sobre os resultados com edições incrementais em vez de refazer tudo.",
    },
    {
      question: "Os projetos são salvos automaticamente?",
      answer:
        "Sim, todos os seus projetos são salvos automaticamente na nuvem conforme você trabalha. Você pode acessá-los de qualquer dispositivo e nunca perderá seu progresso.",
    },
    {
      question: "Posso usar minhas próprias imagens e assets?",
      answer:
        "Sim! Você pode fazer upload de imagens, logos, ícones e outros arquivos. A IA integrará automaticamente seus assets no design gerado.",
    },
    {
      question: "Como funciona a responsividade?",
      answer:
        "Todos os websites gerados são automaticamente responsivos e otimizados para mobile, tablet e desktop. Você pode testar diferentes resoluções usando o botão de preview responsivo.",
    },
    {
      question: "Posso integrar APIs e bancos de dados?",
      answer:
        "Sim! Você pode pedir para a IA adicionar integrações com APIs populares, formulários com backend, autenticação, e até mesmo código para conectar com bancos de dados.",
    },
    {
      question: "Existe limite de projetos que posso criar?",
      answer:
        "O limite depende do seu plano. Usuários free têm um número limitado de projetos, enquanto planos premium oferecem projetos ilimitados e recursos avançados.",
    },
    {
      question: "Como faço para publicar meu website?",
      answer:
        "Você tem várias opções: publicar diretamente na Vercel com um clique, fazer push para GitHub e usar GitHub Pages, ou baixar os arquivos e hospedar em qualquer provedor de sua escolha.",
    },
  ]

  const filteredGuides = filterContent(guides)
  const filteredFaqs = filterContent(faqs)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Centro de Ajuda</h2>
              <p className="text-sm text-neutral-300">Tudo que você precisa saber sobre o Wexar</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-neutral-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Pesquisar guias, FAQs, tutoriais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-neutral-950 border border-neutral-700 rounded-xl pl-12 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery("")}
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="guides" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start border-b border-neutral-800 rounded-none bg-transparent p-0 h-auto">
            <TabsTrigger
              value="guides"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4 text-neutral-400 data-[state=active]:text-white font-medium"
            >
              <Book className="w-4 h-4 mr-2" />
              Guias
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4 text-neutral-400 data-[state=active]:text-white font-medium"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger
              value="shortcuts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4 text-neutral-400 data-[state=active]:text-white font-medium"
            >
              <Zap className="w-4 h-4 mr-2" />
              Atalhos
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4 text-neutral-400 data-[state=active]:text-white font-medium"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contacto
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsContent value="guides" className="p-6 m-0">
              {filteredGuides.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">Nenhum guia encontrado para "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGuides.map((guide, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-xl bg-${guide.color}-500/10 border border-${guide.color}-500/20 flex items-center justify-center flex-shrink-0`}
                        >
                          <guide.icon className={`w-7 h-7 text-${guide.color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-medium text-${guide.color}-400 bg-${guide.color}-500/10 px-2 py-0.5 rounded-full`}
                            >
                              {guide.category}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                            {guide.title}
                          </h3>
                          <p className="text-sm text-neutral-400 leading-relaxed">{guide.description}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="faq" className="p-6 m-0">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">Nenhuma pergunta encontrada para "{searchQuery}"</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-3">
                  {filteredFaqs.map((faq, idx) => (
                    <details
                      key={idx}
                      className="group p-5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all"
                    >
                      <summary className="cursor-pointer text-base font-medium text-white list-none flex items-center justify-between">
                        <span className="flex items-start gap-3 flex-1">
                          <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span>{faq.question}</span>
                        </span>
                        <span className="text-neutral-500 group-open:rotate-180 transition-transform ml-4 flex-shrink-0">
                          ▼
                        </span>
                      </summary>
                      <p className="mt-4 ml-8 text-sm text-neutral-400 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shortcuts" className="p-6 m-0">
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Atalhos de Teclado</h3>
                  <p className="text-sm text-neutral-400">Aumente sua produtividade com estes atalhos</p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      category: "Geral",
                      shortcuts: [
                        { keys: ["Ctrl", "K"], description: "Abrir busca rápida" },
                        { keys: ["Ctrl", "N"], description: "Novo projeto" },
                        { keys: ["Ctrl", "S"], description: "Salvar projeto" },
                        { keys: ["Ctrl", "/"], description: "Abrir centro de ajuda" },
                      ],
                    },
                    {
                      category: "Editor",
                      shortcuts: [
                        { keys: ["Ctrl", "Enter"], description: "Enviar prompt / gerar" },
                        { keys: ["Ctrl", "Z"], description: "Desfazer" },
                        { keys: ["Ctrl", "Y"], description: "Refazer" },
                        { keys: ["Ctrl", "D"], description: "Duplicar linha" },
                      ],
                    },
                    {
                      category: "Preview",
                      shortcuts: [
                        { keys: ["Ctrl", "P"], description: "Alternar preview" },
                        { keys: ["Ctrl", "R"], description: "Refresh preview" },
                        { keys: ["Ctrl", "M"], description: "Alternar responsividade" },
                      ],
                    },
                  ].map((section, idx) => (
                    <div key={idx}>
                      <h4 className="text-sm font-semibold text-neutral-300 mb-3">{section.category}</h4>
                      <div className="space-y-2">
                        {section.shortcuts.map((shortcut, sidx) => (
                          <div
                            key={sidx}
                            className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800"
                          >
                            <span className="text-sm text-neutral-300">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, kidx) => (
                                <span key={kidx} className="flex items-center gap-1">
                                  <kbd className="px-2 py-1 text-xs font-semibold text-white bg-neutral-800 border border-neutral-700 rounded">
                                    {key}
                                  </kbd>
                                  {kidx < shortcut.keys.length - 1 && <span className="text-neutral-600">+</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="p-6 m-0">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Entre em Contacto</h3>
                  <p className="text-neutral-400">
                    Nossa equipe está pronta para ajudar você com qualquer dúvida ou problema
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <Button
                    onClick={() => window.open("mailto:support@wexar.ai", "_blank")}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 text-base rounded-xl"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Enviar Email
                  </Button>

                  <Button
                    onClick={() => window.open("https://discord.gg/wexar", "_blank")}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-14 text-base rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Discord Community
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Mail, label: "Email", value: "support@wexar.ai" },
                    { icon: Globe, label: "Website", value: "wexar.ai" },
                    { icon: MessageCircle, label: "Discord", value: "@wexar" },
                  ].map((contact, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                      <contact.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-xs text-neutral-500 mb-1">{contact.label}</div>
                      <div className="text-sm text-white font-medium">{contact.value}</div>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <h4 className="text-base font-semibold text-white mb-4">Horário de Atendimento</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-400 mb-1">Segunda - Sexta</div>
                      <div className="text-white font-medium">9h - 18h GMT</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 mb-1">Tempo de Resposta</div>
                      <div className="text-white font-medium">Até 24 horas</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
