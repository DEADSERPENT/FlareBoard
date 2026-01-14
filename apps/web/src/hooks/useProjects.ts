import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Project } from '@flareboard/types'

// Query keys
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

export function useProject(id: string) {
  return useQuery({
    queryKey: projectsKeys.detail(id),
    queryFn: async () => {
      const response = await api.getProject(id)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error('Failed to fetch project')
    },
    enabled: !!id,
  })
}

// Project mutations
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const response = await api.createProject(data)
      if (!response.success || !response.data) {
        throw new Error('Failed to create project')
      }
      return response.data
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
      queryClient.setQueryData<Project[]>(projectsKeys.lists(), (old) => {
        if (!old) return [newProject]
        return [...old, newProject]
      })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const response = await api.updateProject(id, data)
      if (!response.success || !response.data) {
        throw new Error('Failed to update project')
      }
      return response.data
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData<Project>(
        projectsKeys.detail(updatedProject.id),
        updatedProject
      )
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.deleteProject(id)
      if (!response.success) {
        throw new Error('Failed to delete project')
      }
      return id
    },
    onSuccess: (deletedId) => {
      queryClient.removeQueries({ queryKey: projectsKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
    },
  })
}
