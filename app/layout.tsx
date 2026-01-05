import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Site Builder - Crie Sites com Inteligência Artificial",
  description: "Gerador de sites com IA powered by DeepSeek R1. Crie sites completos e responsivos em segundos.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
