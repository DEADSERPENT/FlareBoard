import { Calendar, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Badge } from '../ui/Badge'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  position: number
  projectId: string
  dueDate?: Date | string | null
  assignee?: {
    id: string
    fullName: string
    email: string
    avatarUrl?: string | null
  } | null
}

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragEnd: (e: React.DragEvent) => void
  onClick?: (task: Task) => void
}

export function TaskCard({ task, onDragStart, onDragEnd, onClick }: TaskCardProps) {
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertCircle className="w-3 h-3" />
      case 'Medium':
        return <Clock className="w-3 h-3" />
      case 'Low':
        return <CheckCircle2 className="w-3 h-3" />
      default:
        return null
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(task)}
      className="bg-white rounded-lg border border-neutral-200 p-4 mb-3 cursor-move hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
          {task.title}
        </h4>
        <Badge className={`${getPriorityColor(task.priority)} flex items-center gap-1 text-xs`}>
          {getPriorityIcon(task.priority)}
          {task.priority}
        </Badge>
      </div>

      {task.description && (
        <p className="text-xs text-neutral-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {task.assignee ? (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium">
              {getInitials(task.assignee.fullName)}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-neutral-400">
            <User className="w-3 h-3" />
            <span>Unassigned</span>
          </div>
        )}
      </div>
    </div>
  )
}
