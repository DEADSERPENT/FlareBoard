import { formatDistanceToNow } from 'date-fns'
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  MessageSquare,
  CheckSquare,
  FolderOpen,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '@flareboard/types'
import { useMarkAsRead, useDeleteNotification } from '@/hooks/useNotifications'

interface NotificationItemProps {
  notification: Notification
  onClose?: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const navigate = useNavigate()
  const markAsRead = useMarkAsRead()
  const deleteNotification = useDeleteNotification()

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'mention':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'task':
        return <CheckSquare className="w-5 h-5 text-purple-500" />
      case 'project':
        return <FolderOpen className="w-5 h-5 text-indigo-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getPriorityStyle = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50'
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50'
      default:
        return 'border-l-0'
    }
  }

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id)
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      onClose?.()
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteNotification.mutateAsync(notification.id)
  }

  return (
    <div
      onClick={handleClick}
      className={`
        group relative p-4 transition-all duration-200 cursor-pointer
        ${!notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-neutral-50'}
        ${getPriorityStyle()}
        border-b border-neutral-100 last:border-b-0
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>

          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>

            {notification.actionText && (
              <span className="text-xs font-medium text-primary-600 hover:text-primary-700">
                {notification.actionText} →
              </span>
            )}
          </div>
        </div>

        {/* Delete button (appears on hover) */}
        <button
          onClick={handleDelete}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-200 rounded"
        >
          <X className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
        </button>
      </div>
    </div>
  )
}
