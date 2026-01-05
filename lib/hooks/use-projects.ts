"use client"

import { useState, useEffect } from "react"

export interface Project {
  id: string
  name: string
  description?: string
  code: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
  versions?: any[]
  lastDeployment?: any
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/projects")

      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const result = await response.json()
      setProjects(result.data?.data || result.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching projects:", err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Partial<Project>) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create project")
      }

      const result = await response.json()
      const newProject = result.data
      setProjects((prev) => [newProject, ...prev])
      return newProject
    } catch (err) {
      console.error("Error creating project:", err)
      throw err
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      const result = await response.json()
      const updatedProject = result.data
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)))
      return updatedProject
    } catch (err) {
      console.error("Error updating project:", err)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Error deleting project:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh: fetchProjects,
  }
}
