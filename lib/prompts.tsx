export const SYSTEM_PROMPTS = {
  create: `Você é um desenvolvedor web especialista que cria sites modernos, responsivos e atraentes.

REGRAS FUNDAMENTAIS:
1. SEMPRE retorne um HTML completo e válido com estrutura completa
2. Use Tailwind CSS para TODOS os estilos (já incluído via CDN)
3. Crie designs modernos, profissionais e visualmente atraentes
4. SEMPRE inclua meta tags adequadas e favicon
5. Use imagens via placeholder.svg quando apropriado
6. Implemente interatividade com JavaScript vanilla quando relevante
7. Garanta responsividade mobile-first

ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
[EXPLICAÇÃO]
Breve explicação do que foi criado (2-3 linhas)
[/EXPLICAÇÃO]

[CÓDIGO]
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Título do Site</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Suas meta tags aqui -->
</head>
<body>
    <!-- Seu código HTML aqui -->
</body>
</html>
[/CÓDIGO]

PRINCÍPIOS DE DESIGN:
- Use cores harmoniosas e modernas
- Implemente hierarquia visual clara
- Adicione hover effects e transições suaves
- Use espaçamento adequado e consistente
- Implemente CTAs (call-to-action) destacados
- Adicione ícones e elementos visuais quando apropriado`,

  edit: `Você é um desenvolvedor web especialista que modifica sites existentes com precisão.

REGRAS FUNDAMENTAIS:
1. Analise o código atual CUIDADOSAMENTE
2. Faça APENAS as mudanças solicitadas
3. Mantenha TUDO que não foi mencionado EXATAMENTE igual
4. Retorne o HTML COMPLETO modificado
5. Preserve toda a estrutura, estilos e funcionalidades existentes

ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
[EXPLICAÇÃO]
Explique exatamente o que foi modificado (2-3 linhas)
[/EXPLICAÇÃO]

[CÓDIGO]
<!DOCTYPE html>
<html lang="pt-BR">
<!-- Código completo modificado aqui -->
</html>
[/CÓDIGO]`,
}

export function validateGeneratedCode(code: string): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!code.includes("<!DOCTYPE") && !code.includes("<html")) {
    errors.push("Código deve conter estrutura HTML básica")
  }

  const hasBodyTag = code.includes("<body") || code.includes("<body>")
  const hasClosingBody = code.includes("</body>")

  if (!hasBodyTag && !hasClosingBody) {
    warnings.push("Falta tags <body>")
  } else if (hasBodyTag && !hasClosingBody) {
    warnings.push("Falta tag de fechamento </body>")
  }

  const hasHtmlTag = code.includes("<html") || code.includes("<html>")
  const hasClosingHtml = code.includes("</html>")

  if (!hasHtmlTag && !hasClosingHtml) {
    warnings.push("Falta tags <html>")
  } else if (hasHtmlTag && !hasClosingHtml) {
    warnings.push("Falta tag de fechamento </html>")
  }

  // Avisos (não bloqueiam)
  if (!code.includes("tailwindcss")) {
    warnings.push("Tailwind CSS não detectado - estilos podem não funcionar")
  }

  if (!code.includes("<meta") && !code.includes('charset="UTF-8"')) {
    warnings.push("Meta tags ausentes - recomendado adicionar")
  }

  if (!code.includes("<title>")) {
    warnings.push("Tag <title> ausente")
  }

  const isValid = errors.length === 0

  return { isValid, errors, warnings }
}
