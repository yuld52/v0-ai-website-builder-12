"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code2, Copy, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Snippet {
  id: string
  title: string
  description: string
  code: string
  category: string
}

interface SnippetLibraryProps {
  onInsert: (code: string) => void
}

export function SnippetLibrary({ onInsert }: SnippetLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const snippets: Snippet[] = [
    {
      id: "1",
      title: "Seção Hero",
      description: "Seção hero moderna com CTA",
      category: "Layout",
      code: `<section class="hero">
  <h1>Bem-vindo</h1>
  <p>Descrição incrível</p>
  <button>Começar</button>
</section>`,
    },
    {
      id: "2",
      title: "Componente Card",
      description: "Card responsivo com imagem",
      category: "Componentes",
      code: `<div class="card">
  <img src="placeholder.jpg" alt="Image">
  <h3>Título do Card</h3>
  <p>Descrição do card</p>
</div>`,
    },
    {
      id: "3",
      title: "Barra de Navegação",
      description: "Navbar responsiva com menu",
      category: "Layout",
      code: `<nav class="navbar">
  <div class="logo">Logo</div>
  <ul class="nav-links">
    <li><a href="#">Início</a></li>
    <li><a href="#">Sobre</a></li>
    <li><a href="#">Contato</a></li>
  </ul>
</nav>`,
    },
    {
      id: "4",
      title: "Formulário de Contato",
      description: "Formulário de contato completo",
      category: "Formulários",
      code: `<form class="contact-form">
  <input type="text" placeholder="Nome" required>
  <input type="email" placeholder="Email" required>
  <textarea placeholder="Mensagem" rows="4"></textarea>
  <button type="submit">Enviar</button>
</form>`,
    },
    {
      id: "5",
      title: "Rodapé",
      description: "Rodapé com links e redes sociais",
      category: "Layout",
      code: `<footer class="footer">
  <div class="footer-content">
    <p>&copy; 2025 Sua Empresa</p>
    <div class="social-links">
      <a href="#">Facebook</a>
      <a href="#">Twitter</a>
      <a href="#">Instagram</a>
    </div>
  </div>
</footer>`,
    },
  ]

  const filteredSnippets = snippets.filter(
    (snippet) =>
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const copySnippet = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Snippet copiado",
      description: "O código foi copiado para a área de transferência",
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar snippets..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">Nenhum snippet encontrado</p>
          </div>
        ) : (
          filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{snippet.title}</h3>
                  <p className="text-white/50 text-sm mb-2">{snippet.description}</p>
                  <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">{snippet.category}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onInsert(snippet.code)}
                  className="flex-1 text-white/70 hover:text-white"
                >
                  <Code2 className="w-4 h-4 mr-2" />
                  Inserir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copySnippet(snippet.code)}
                  className="text-white/70 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
