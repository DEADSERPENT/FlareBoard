import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Task} from '@nebula/types'

export const useTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [projectId])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await api.getTasks(projectId)
      if (response.success && response.data) {
        setTasks(response.data)
      } else {
        setError(response.error?.message || 'Failed to load tasks')
      }
    } catch (err) {
      setError('Failed to connect to API')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (data: Partial<Task>) => {
    try {
      const response = await api.createTask(data)
      if (response.success && response.data) {
        setTasks(prev => [...prev, response.data!])
        return response.data
      }
      throw new Error(response.error?.message || 'Failed to create task')
    } catch (err) {
      throw err
    }
  }

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      const response = await api.updateTask(id, data)
      if (response.success && response.data) {
        setTasks(prev => prev.map(t => (t.id === id ? response.data! : t)))
        return response.data
      }
      throw new Error(response.error?.message || 'Failed to update task')
    } catch (err) {
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await api.deleteTask(id)
      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== id))
      } else {
        throw new Error(response.error?.message || 'Failed to delete task')
      }
    } catch (err) {
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh: loadTasks,
  }
}
