import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Project } from '@nebula/types'

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await api.getProjects()
      if (response.success && response.data) {
        setProjects(response.data)
      } else {
        setError(response.error?.message || 'Failed to load projects')
      }
    } catch (err) {
      setError('Failed to connect to API')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (data: Partial<Project>) => {
    try {
      const response = await api.createProject(data)
      if (response.success && response.data) {
        setProjects(prev => [...prev, response.data!])
        return response.data
      }
      throw new Error(response.error?.message || 'Failed to create project')
    } catch (err) {
      throw err
    }
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    try {
      const response = await api.updateProject(id, data)
      if (response.success && response.data) {
        setProjects(prev => prev.map(p => (p.id === id ? response.data! : p)))
        return response.data
      }
      throw new Error(response.error?.message || 'Failed to update project')
    } catch (err) {
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const response = await api.deleteProject(id)
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== id))
      } else {
        throw new Error(response.error?.message || 'Failed to delete project')
      }
    } catch (err) {
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh: loadProjects,
  }
}
