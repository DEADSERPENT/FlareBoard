import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import type { Notification } from '@flareboard/types'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearReadNotifications: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { token, user } = useAuth()
  const toast = useToast()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
      return
    }

    const newSocket = io('http://localhost:3000', {
      auth: { token },
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      setConnected(true)
      fetchNotifications()
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server')
      setConnected(false)
    })

    newSocket.on('notification:new', (notification: Notification) => {
      console.log('📬 New notification received:', notification)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Show toast notification
      toast.info(notification.title || 'Notification', notification.message || notification.content)

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title || 'Notification', {
          body: notification.message || notification.content,
          icon: '/flare-icon.png',
        })
      }
    })

    newSocket.on('task:updated', (task: any) => {
      console.log('📝 Task updated:', task)
      // Can emit custom event for components to listen
      window.dispatchEvent(new CustomEvent('task:updated', { detail: task }))
    })

    newSocket.on('project:updated', (project: any) => {
      console.log('📁 Project updated:', project)
      window.dispatchEvent(new CustomEvent('project:updated', { detail: project }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [token, user])

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.data)
          setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const notification = notifications.find((n) => n.id === notificationId)
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // Clear all read notifications
  const clearReadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/notifications/clear-read', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => !n.isRead))
      }
    } catch (error) {
      console.error('Failed to clear read notifications:', error)
    }
  }

  // Request notification permission on mount
  useEffect(() => {
    if (user && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [user])

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearReadNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
