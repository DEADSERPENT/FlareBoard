import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { SortableTaskCard } from './SortableTaskCard'
import type { Task } from '@flareboard/types'

interface KanbanColumnProps {
  title: string
  status: string
  tasks: Task[]
  onAddTask?: (status: string) => void
  onTaskClick?: (task: Task) => void
  color: string
}

const colorMap: Record<string, { dot: string; bg: string; ring: string; count: string }> = {
  blue:    { dot: 'bg-blue-500',    bg: 'bg-blue-50/60',    ring: 'ring-blue-400',    count: 'bg-blue-100 text-blue-700' },
  yellow:  { dot: 'bg-amber-400',   bg: 'bg-amber-50/60',   ring: 'ring-amber-400',   count: 'bg-amber-100 text-amber-700' },
  green:   { dot: 'bg-emerald-500', bg: 'bg-emerald-50/60', ring: 'ring-emerald-400', count: 'bg-emerald-100 text-emerald-700' },
  red:     { dot: 'bg-red-500',     bg: 'bg-red-50/60',     ring: 'ring-red-400',     count: 'bg-red-100 text-red-700' },
  default: { dot: 'bg-neutral-400', bg: 'bg-neutral-50',    ring: 'ring-neutral-300', count: 'bg-neutral-100 text-neutral-600' },
}

export function KanbanColumn({ title, status, tasks, onAddTask, onTaskClick, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: 'Column', status } })
  const c = colorMap[color] ?? colorMap.default

  return (
    <div className="flex flex-col min-w-[280px] w-[280px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${c.dot} pulse-dot`} />
          <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.count}`}>
            {tasks.length}
          </span>
        </div>
        {onAddTask && (
          <button
            onClick={() => onAddTask(status)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2.5 min-h-[480px] transition-all duration-150 ${c.bg} ${
          isOver ? `ring-2 ${c.ring} ring-opacity-60 scale-[1.01]` : ''
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed ${
              isOver ? 'border-primary-300 bg-primary-50' : 'border-neutral-200'
            } transition-colors`}>
              <p className="text-xs text-neutral-400 font-medium">
                {isOver ? 'Drop here' : 'No tasks'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map(task => (
                <SortableTaskCard key={task.id} task={task} onClick={onTaskClick || (() => {})} />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
