"use client"

import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PricingPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function PricingPopup({ isOpen, onClose }: PricingPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Header */}
        <div className="text-center pt-12 pb-8 px-6">
          <h2 className="text-4xl font-bold text-white mb-3">Escolha Seu Plano</h2>
          <p className="text-neutral-400 text-lg">Comece a construir com geração de sites por IA</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 px-8 pb-12">
          {/* Free Plan */}
          <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Gratuito</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">R$0</span>
                <span className="text-neutral-400">/mês</span>
              </div>
              <p className="text-neutral-400 text-sm">Perfeito para experimentar a plataforma</p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>5 gerações de sites por mês</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Templates básicos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Exportação de código</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Suporte da comunidade</span>
              </li>
            </ul>

            <Button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white">Começar</Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-blue-950/50 to-neutral-950 rounded-xl border-2 border-blue-600 p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              POPULAR
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">R$29</span>
                <span className="text-neutral-400">/mês</span>
              </div>
              <p className="text-neutral-400 text-sm">Para profissionais e pequenas equipes</p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Gerações ilimitadas de sites</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Templates avançados</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Processamento IA prioritário</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Marca personalizada</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Histórico de versões</span>
              </li>
            </ul>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Assinar Pro</Button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Empresarial</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">Personalizado</span>
              </div>
              <p className="text-neutral-400 text-sm">Para grandes equipes e organizações</p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Tudo do plano Pro</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Suporte dedicado</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Modelos IA personalizados</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Garantia de SLA</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Colaboração em equipe</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Análises avançadas</span>
              </li>
            </ul>

            <Button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white">Contatar Vendas</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
