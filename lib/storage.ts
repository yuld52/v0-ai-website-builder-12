interface User {
  id: string
  email: string
  name: string
  theme?: "light" | "dark"
}

interface Project {
  id: string
  title: string
  description: string
  code: string
  timestamp: Date
  editCount: number
  isFavorite: boolean
  userId: string
  versions?: ProjectVersion[]
  tags?: string[]
}

interface ProjectVersion {
  id: string
  code: string
  timestamp: Date
  description: string
}

export const storage = {
  getUser(): User | null {
    if (typeof window === "undefined") return null
    const userData = localStorage.getItem("webly_user")
    return userData ? JSON.parse(userData) : null
  },

  setUser(user: User) {
    localStorage.setItem("webly_user", JSON.stringify(user))
  },

  getProjects(): Project[] {
    if (typeof window === "undefined") return []
    const projectsData = localStorage.getItem("webly_projects")
    return projectsData ? JSON.parse(projectsData) : []
  },

  saveProject(project: Project) {
    const projects = this.getProjects()
    const existingIndex = projects.findIndex((p) => p.id === project.id)

    if (existingIndex >= 0) {
      projects[existingIndex] = project
    } else {
      projects.unshift(project)
    }

    localStorage.setItem("webly_projects", JSON.stringify(projects))
  },

  deleteProject(projectId: string) {
    const projects = this.getProjects().filter((p) => p.id !== projectId)
    localStorage.setItem("webly_projects", JSON.stringify(projects))
  },

  toggleFavorite(projectId: string) {
    const projects = this.getProjects()
    const project = projects.find((p) => p.id === projectId)

    if (project) {
      project.isFavorite = !project.isFavorite
      localStorage.setItem("webly_projects", JSON.stringify(projects))
    }
  },

  saveVersion(projectId: string, code: string, description: string) {
    const projects = this.getProjects()
    const project = projects.find((p) => p.id === projectId)

    if (project) {
      if (!project.versions) project.versions = []

      project.versions.unshift({
        id: `v${project.versions.length + 1}_${Date.now()}`,
        code,
        timestamp: new Date(),
        description,
      })

      // Keep only last 10 versions
      if (project.versions.length > 10) {
        project.versions = project.versions.slice(0, 10)
      }

      localStorage.setItem("webly_projects", JSON.stringify(projects))
    }
  },

  restoreVersion(projectId: string, versionId: string) {
    const projects = this.getProjects()
    const project = projects.find((p) => p.id === projectId)

    if (project && project.versions) {
      const version = project.versions.find((v) => v.id === versionId)
      if (version) {
        project.code = version.code
        localStorage.setItem("webly_projects", JSON.stringify(projects))
        return version.code
      }
    }
    return null
  },

  addTag(projectId: string, tag: string) {
    const projects = this.getProjects()
    const project = projects.find((p) => p.id === projectId)

    if (project) {
      if (!project.tags) project.tags = []
      if (!project.tags.includes(tag)) {
        project.tags.push(tag)
        localStorage.setItem("webly_projects", JSON.stringify(projects))
      }
    }
  },

  removeTag(projectId: string, tag: string) {
    const projects = this.getProjects()
    const project = projects.find((p) => p.id === projectId)

    if (project && project.tags) {
      project.tags = project.tags.filter((t) => t !== tag)
      localStorage.setItem("webly_projects", JSON.stringify(projects))
    }
  },

  setTheme(theme: "light" | "dark") {
    const user = this.getUser()
    if (user) {
      user.theme = theme
      this.setUser(user)
    }
  },

  getTheme(): "light" | "dark" {
    const user = this.getUser()
    return user?.theme || "dark"
  },

  logout() {
    localStorage.removeItem("webly_user")
  },

  getProject(projectId: string): Project | null {
    const projects = this.getProjects()
    return projects.find((p) => p.id === projectId) || null
  },
}
