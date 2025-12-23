import { CheckCircle2, Circle, AlertCircle, Calendar } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface Task {
  id: string
  title: string
  priority: string
  status: string
  dueDate?: string | null
}

interface TaskListWidgetProps {
  title?: string
  tasks: Task[]
  maxItems?: number
}

export function TaskListWidget({ title = 'My Tasks', tasks, maxItems = 5 }: TaskListWidgetProps) {
  const displayTasks = tasks.slice(0, maxItems)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'Low':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Done') {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />
    }
    return <Circle className="w-5 h-5 text-neutral-400" />
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else if (d < today) {
      return 'Overdue'
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = (date: string | null | undefined) => {
    if (!date) return false
    return new Date(date) < new Date() && formatDate(date) === 'Overdue'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <span className="text-sm text-neutral-500">{tasks.length} tasks</span>
      </div>

      <div className="space-y-3">
        {displayTasks.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm">
            No tasks found
          </div>
        ) : (
          displayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group"
            >
              <button className="flex-shrink-0">
                {getStatusIcon(task.status)}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === 'Done' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 text-xs ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-neutral-500'}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                      {isOverdue(task.dueDate) && <AlertCircle className="w-3 h-3" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
