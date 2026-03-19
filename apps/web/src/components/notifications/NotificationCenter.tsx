import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { NotificationItem } from './NotificationItem'
import {
  useNotifications,
  useUnreadCount,
  useMarkAllAsRead,
  useClearReadNotifications,
} from '@/hooks/useNotifications'
import type { NotificationCategory } from '@flareboard/types'

const CATEGORIES: { label: string; value: NotificationCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Tasks', value: 'task' },
  { label: 'Projects', value: 'project' },
  { label: 'Mentions', value: 'mention' },
]

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data, isLoading } = useNotifications({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    unreadOnly: showUnreadOnly,
  })
  const markAllAsRead = useMarkAllAsRead()
  const clearReadNotifications = useClearReadNotifications()

  const notifications = data?.notifications || []
  const totalUnread = data?.unreadCount || 0

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync()
  }

  const handleClearRead = async () => {
    if (window.confirm('Clear all read notifications?')) {
      await clearReadNotifications.mutateAsync()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[420px] bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ maxHeight: '600px' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 z-10">
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Notifications</h2>
              <div className="flex items-center gap-2">
                {totalUnread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsRead.isPending}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={handleClearRead}
                  disabled={clearReadNotifications.isPending}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Clear read notifications"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 px-4 pb-3 overflow-x-auto">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                    ${
                      selectedCategory === category.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }
                  `}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Filter Toggle */}
            <div className="px-4 pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-600">Show unread only</span>
              </label>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-sm font-medium text-neutral-900 mb-1">
                  {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
                </h3>
                <p className="text-sm text-neutral-500">
                  {showUnreadOnly
                    ? "You're all caught up!"
                    : "You'll see notifications here when you have updates"}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={() => setIsOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 p-3 text-center">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to notifications page if you have one
                  // navigate('/notifications')
                }}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
