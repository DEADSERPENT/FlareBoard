import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import {
  Activity as ActivityIcon,
  FolderKanban,
  CheckSquare,
  UserPlus,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata?: any
  timestamp: Date
  user?: {
    id: string
    fullName: string
    avatarUrl?: string
  }
}

export const ActivityPage = () => {
  const { token } = useAuth()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchActivities()
  }, [filter])

  const fetchActivities = async () => {
    try {
      const params = filter !== 'all' ? `?entityType=${filter}` : ''
      const response = await fetch(`http://localhost:3000/api/activity${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setActivities(data.data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (entityType: string) => {
    if (entityType === 'project') return <FolderKanban className="w-5 h-5" />
    if (entityType === 'task') return <CheckSquare className="w-5 h-5" />
    if (entityType === 'user') return <UserPlus className="w-5 h-5" />
    return <ActivityIcon className="w-5 h-5" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'text-green-600 bg-green-100'
    if (action.includes('updated')) return 'text-blue-600 bg-blue-100'
    if (action.includes('deleted') || action.includes('archived')) return 'text-red-600 bg-red-100'
    if (action.includes('completed')) return 'text-purple-600 bg-purple-100'
    return 'text-neutral-600 bg-neutral-100'
  }

  const formatAction = (action: string) => {
    return action
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading activity...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Activity Log</h1>
        <p className="text-neutral-600 mt-1">Track your recent actions and changes</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">Filter by:</span>
          <div className="flex gap-2">
            {['all', 'project', 'task', 'user'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Activity Timeline */}
      {activities.length === 0 ? (
        <Card className="text-center py-16">
          <ActivityIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No activity yet</h3>
          <p className="text-neutral-600">
            Your activity will appear here as you work on projects and tasks
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="card-hover">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActionColor(activity.action)}`}>
                  {getActionIcon(activity.entityType)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">
                        {formatAction(activity.action)}
                      </p>
                      <p className="text-sm text-neutral-600 mt-1">
                        {activity.entityType.charAt(0).toUpperCase() + activity.entityType.slice(1)}{' '}
                        {activity.metadata?.name && `"${activity.metadata.name}"`}
                      </p>
                      {activity.metadata?.description && (
                        <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
                          {activity.metadata.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  {activity.metadata?.changes && (
                    <div className="mt-2 p-2 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-neutral-600">
                        Changes:{' '}
                        {Object.keys(activity.metadata.changes)
                          .map((key) => `${key}`)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Actions</p>
              <p className="text-2xl font-bold text-neutral-900">{activities.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Project Actions</p>
              <p className="text-2xl font-bold text-neutral-900">
                {activities.filter((a) => a.entityType === 'project').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Task Actions</p>
              <p className="text-2xl font-bold text-neutral-900">
                {activities.filter((a) => a.entityType === 'task').length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
