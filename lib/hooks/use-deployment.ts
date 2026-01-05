"use client"

import { useState } from "react"

export function useDeployment() {
  const [deploying, setDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null)

  const deploy = async (projectId: string, platform = "vercel") => {
    try {
      setDeploying(true)
      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, environment: "production" }),
      })

      if (!response.ok) {
        throw new Error("Failed to deploy")
      }

      const data = await response.json()
      setDeploymentStatus(data.data)

      // Poll for deployment status
      const pollStatus = setInterval(async () => {
        const statusResponse = await fetch(`/api/deployments/${data.data.id}`)
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setDeploymentStatus(statusData.data)

          if (statusData.data.status === "ready" || statusData.data.status === "failed") {
            clearInterval(pollStatus)
            setDeploying(false)
          }
        }
      }, 2000)

      return data.data
    } catch (err) {
      console.error("Error deploying:", err)
      setDeploying(false)
      throw err
    }
  }

  const getDeploymentStatus = async (deploymentId: string) => {
    try {
      const response = await fetch(`/api/deployments/${deploymentId}`)
      if (!response.ok) {
        throw new Error("Failed to get deployment status")
      }
      const data = await response.json()
      return data.data
    } catch (err) {
      console.error("Error getting deployment status:", err)
      throw err
    }
  }

  return {
    deploying,
    deploymentStatus,
    deploy,
    getDeploymentStatus,
  }
}
