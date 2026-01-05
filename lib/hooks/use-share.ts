"use client"

import { useState } from "react"

export function useShare() {
  const [sharing, setSharing] = useState(false)

  const shareProject = async (projectId: string, options: { visibility?: string; expiresIn?: number } = {}) => {
    try {
      setSharing(true)
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error("Failed to share project")
      }

      const data = await response.json()
      return data.data
    } catch (err) {
      console.error("Error sharing project:", err)
      throw err
    } finally {
      setSharing(false)
    }
  }

  const getSharedProject = async (token: string) => {
    try {
      const response = await fetch(`/api/share/${token}`)
      if (!response.ok) {
        throw new Error("Failed to get shared project")
      }
      const data = await response.json()
      return data.data
    } catch (err) {
      console.error("Error getting shared project:", err)
      throw err
    }
  }

  return {
    sharing,
    shareProject,
    getSharedProject,
  }
}
