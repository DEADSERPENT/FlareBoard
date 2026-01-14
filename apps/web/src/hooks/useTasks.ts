import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Task } from '@flareboard/types'

// Query keys
export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (projectId?: string) => [...tasksKeys.lists(), { projectId }] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
}

export const projectsKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsKeys.all, 'list'] as const,
  details: () => [...projectsKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectsKeys.details(), id] as const,
}

// Projects hooks
export function useProjects() {
  return useQuery({
    queryKey: projectsKeys.lists(),
    queryFn: async () => {
      const response = await api.getProjects()
      if (response.success && response.data) {
        return response.data
      }
      throw new Error('Failed to fetch projects')
    },
  })
}

// Tasks hooks
export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: tasksKeys.list(projectId),
    queryFn: async () => {
      const response = await api.getTasks(projectId)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error('Failed to fetch tasks')
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: tasksKeys.detail(id),
    queryFn: async () => {
      const response = await api.getTask(id)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error('Failed to fetch task')
    },
    enabled: !!id,
  })
}

// Task mutations
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await api.createTask(data)
      if (!response.success || !response.data) {
        throw new Error('Failed to create task')
      }
      return response.data
    },
    onSuccess: (newTask) => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })

      // Optionally add the new task to the cache optimistically
      queryClient.setQueryData<Task[]>(tasksKeys.list(newTask.projectId), (old) => {
        if (!old) return [newTask]
        return [...old, newTask]
      })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await api.updateTask(id, data)
      if (!response.success || !response.data) {
        throw new Error('Failed to update task')
      }
      return response.data
    },
    onSuccess: (updatedTask) => {
      // Update task in cache
      queryClient.setQueryData<Task>(tasksKeys.detail(updatedTask.id), updatedTask)

      // Invalidate tasks lists to refetch
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.deleteTask(id)
      if (!response.success) {
        throw new Error('Failed to delete task')
      }
      return id
    },
    onSuccess: (deletedId) => {
      // Remove task from cache
      queryClient.removeQueries({ queryKey: tasksKeys.detail(deletedId) })

      // Invalidate tasks lists to refetch
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
    },
  })
}

// Optimistic mutation for drag-and-drop
export function useUpdateTaskOptimistic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await api.updateTask(id, data)
      if (!response.success || !response.data) {
        throw new Error('Failed to update task')
      }
      return response.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: tasksKeys.lists() })

      // Snapshot previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: tasksKeys.lists() })

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: tasksKeys.lists() }, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((task: Task) =>
          task.id === id ? { ...task, ...data } : task
        )
      })

      return { previousTasks }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
    },
  })
}

// Deleted tasks (Trash)
export function useDeletedTasks(projectId?: string) {
  return useQuery({
    queryKey: [...tasksKeys.all, 'deleted', projectId],
    queryFn: async () => {
      const response = await api.getDeletedTasks(projectId)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error('Failed to fetch deleted tasks')
    },
  })
}

export function useRestoreTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.restoreTask(id)
      if (!response.success || !response.data) {
        throw new Error('Failed to restore task')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate both deleted and regular task lists
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...tasksKeys.all, 'deleted'] })
    },
  })
}
