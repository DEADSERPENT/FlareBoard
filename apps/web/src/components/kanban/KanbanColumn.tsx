import { Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { Button } from '../ui/Button'

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

interface KanbanColumnProps {
  title: string
  status: string
  tasks: Task[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: string) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragEnd: (e: React.DragEvent) => void
  onAddTask?: (status: string) => void
  onTaskClick?: (task: Task) => void
  color: string
}

export function KanbanColumn({
  title,
  status,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onAddTask,
  onTaskClick,
  color,
}: KanbanColumnProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          badge: 'bg-blue-100',
        }
      case 'yellow':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100',
        }
      case 'green':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          text: 'text-green-700',
          badge: 'bg-green-100',
        }
      default:
        return {
          border: 'border-neutral-200',
          bg: 'bg-neutral-50',
          text: 'text-neutral-700',
          badge: 'bg-neutral-100',
        }
    }
  }

  const colors = getColorClasses(color)

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${colors.border}`}>
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${colors.text}`}>{title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge} ${colors.text}`}>
            {tasks.length}
          </span>
        </div>
        {onAddTask && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask(status)}
            className="h-7 w-7 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, status)}
        className={`flex-1 ${colors.bg} rounded-lg p-3 min-h-[500px] transition-colors`}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
