"use client"
import type React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface StarsBackgroundProps {
  starDensity?: number
  allStarsTwinkle?: boolean
  twinkleProbability?: number
  minTwinkleSpeed?: number
  maxTwinkleSpeed?: number
  className?: string
}

export const StarsBackground: React.FC<StarsBackgroundProps> = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const stars: Array<{
      x: number
      y: number
      radius: number
      opacity: number
      twinkleSpeed: number | null
    }> = []

    const starCount = Math.floor(canvas.width * canvas.height * starDensity)

    for (let i = 0; i < starCount; i++) {
      const shouldTwinkle = allStarsTwinkle || Math.random() < twinkleProbability
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random(),
        twinkleSpeed: shouldTwinkle ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed) : null,
      })
    }

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        if (star.twinkleSpeed !== null) {
          star.opacity += (Math.random() - 0.5) * star.twinkleSpeed * 0.05
          star.opacity = Math.max(0, Math.min(1, star.opacity))
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed])

  return <canvas ref={canvasRef} className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />
}
