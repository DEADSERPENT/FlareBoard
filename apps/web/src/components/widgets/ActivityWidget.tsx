import { Clock, CheckCircle2, AlertCircle, UserPlus, FolderPlus } from 'lucide-react'
import { Card } from '../ui/Card'

interface Activity {
  id: string
  type: 'task_completed' | 'task_created' | 'user_added' | 'project_created'
  message: string
  user: string
  timestamp: string
}

interface ActivityWidgetProps {
  title?: string
  activities: Activity[]
  maxItems?: number
}

export function ActivityWidget({ title = 'Recent Activity', activities, maxItems = 5 }: ActivityWidgetProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'task_created':
        return <AlertCircle className="w-4 h-4 text-blue-600" />
      case 'user_added':
        return <UserPlus className="w-4 h-4 text-purple-600" />
      case 'project_created':
        return <FolderPlus className="w-4 h-4 text-primary-600" />
      default:
        return <Clock className="w-4 h-4 text-neutral-600" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-100'
      case 'task_created':
        return 'bg-blue-100'
      case 'user_added':
        return 'bg-purple-100'
      case 'project_created':
        return 'bg-primary-100'
      default:
        return 'bg-neutral-100'
    }
  }

  const displayActivities = activities.slice(0, maxItems)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm">
            No recent activity
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-900">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-neutral-600">{activity.message}</span>
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                  <Clock className="w-3 h-3" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
