"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ShootingStarsProps {
  minSpeed?: number
  maxSpeed?: number
  minDelay?: number
  maxDelay?: number
  starColor?: string
  trailColor?: string
  starWidth?: number
  starHeight?: number
  className?: string
}

interface Star {
  id: number
  x: number
  y: number
  angle: number
  scale: number
  speed: number
  distance: number
}

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [star, setStar] = useState<Star | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const createStar = () => {
      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const x = Math.random() * rect.width
      const y = Math.random() * rect.height
      const angle = Math.random() * 60 - 30
      const scale = Math.random() * 1 + 0.3
      const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed
      const distance = Math.random() * 200 + 100

      setStar({ id: Date.now(), x, y, angle, scale, speed, distance })

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay
      setTimeout(createStar, randomDelay)
    }

    const initialDelay = Math.random() * maxDelay
    const timeoutId = setTimeout(createStar, initialDelay)

    return () => clearTimeout(timeoutId)
  }, [minSpeed, maxSpeed, minDelay, maxDelay])

  return (
    <svg ref={svgRef} className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill="url(#gradient)"
          transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${star.y + starHeight / 2})`}
          style={
            {
              animation: `shooting ${star.speed}s linear forwards`,
              "--translate-x": `${Math.cos((star.angle * Math.PI) / 180) * star.distance}px`,
              "--translate-y": `${Math.sin((star.angle * Math.PI) / 180) * star.distance}px`,
            } as React.CSSProperties
          }
        />
      )}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <style>
        {`
          @keyframes shooting {
            0% {
              opacity: 1;
              transform: translate(0, 0);
            }
            100% {
              opacity: 0;
              transform: translate(var(--translate-x), var(--translate-y));
            }
          }
        `}
      </style>
    </svg>
  )
}
