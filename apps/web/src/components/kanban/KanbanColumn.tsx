import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { SortableTaskCard } from './SortableTaskCard'
import { Button } from '../ui/Button'
import type { Task } from '@flareboard/types'

interface KanbanColumnProps {
  title: string
  status: string
  tasks: Task[]
  onAddTask?: (status: string) => void
  onTaskClick?: (task: Task) => void
  color: string
}

export function KanbanColumn({
  title,
  status,
  tasks,
  onAddTask,
  onTaskClick,
  color,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  })

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
        ref={setNodeRef}
        className={`flex-1 ${colors.bg} rounded-lg p-3 min-h-[500px] transition-colors ${
          isOver ? 'ring-2 ring-primary-400 ring-opacity-50' : ''
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
              No tasks
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick || (() => {})}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
