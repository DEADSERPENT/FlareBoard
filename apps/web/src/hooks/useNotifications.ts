import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
}

// Get all notifications
export function useNotifications(params?: { unreadOnly?: boolean; category?: string }) {
  return useQuery({
    queryKey: [...notificationKeys.lists(), params],
    queryFn: async () => {
      const response = await api.getNotifications(params)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error('Failed to fetch notifications')
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Get unread count
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await api.getUnreadCount()
      if (response.success && response.data) {
        return response.data.count
      }
      return 0
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

// Mark notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.markNotificationAsRead(notificationId)
      if (!response.success || !response.data) {
        throw new Error('Failed to mark notification as read')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

// Mark all as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.markAllNotificationsAsRead()
      if (!response.success) {
        throw new Error('Failed to mark all notifications as read')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.deleteNotification(notificationId)
      if (!response.success) {
        throw new Error('Failed to delete notification')
      }
      return notificationId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

// Clear all read notifications
export function useClearReadNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.clearReadNotifications()
      if (!response.success) {
        throw new Error('Failed to clear read notifications')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}
