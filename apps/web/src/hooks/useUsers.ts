import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: usersKeys.lists(),
    queryFn: async () => {
      const response = await api.getUsers()
      if (response.success && response.data) {
        return response.data as Array<{
          id: string
          fullName: string
          email: string
          avatarUrl?: string | null
          roleId: string
          role?: { name: string }
          _count?: { assignedTasks: number }
        }>
      }
      throw new Error('Failed to fetch users')
    },
    staleTime: 5 * 60 * 1000,
  })
}
