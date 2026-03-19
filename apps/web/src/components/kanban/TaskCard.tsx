import { Calendar, User } from 'lucide-react'
import type { Task } from '@flareboard/types'

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragEnd: (e: React.DragEvent) => void
  onClick?: (task: Task) => void
}

const priorityBorder: Record<string, string> = {
  Urgent: 'priority-urgent',
  High:   'priority-high',
  Medium: 'priority-medium',
  Low:    'priority-low',
}

const priorityDot: Record<string, string> = {
  Urgent: 'bg-red-500',
  High:   'bg-orange-500',
  Medium: 'bg-yellow-400',
  Low:    'bg-green-500',
}

const priorityLabel: Record<string, string> = {
  Urgent: 'text-red-600 bg-red-50',
  High:   'text-orange-600 bg-orange-50',
  Medium: 'text-yellow-700 bg-yellow-50',
  Low:    'text-green-700 bg-green-50',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return null
  const d = new Date(date)
  const isOverdue = d < new Date()
  return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: isOverdue }
}

export function TaskCard({ task, onDragStart, onDragEnd, onClick }: TaskCardProps) {
  const due = formatDate(task.dueDate)
  const border = priorityBorder[task.priority] ?? ''

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(task)}
      className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-3.5 cursor-move transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 group ${border}`}
    >
      {/* Priority dot + label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority] ?? 'bg-neutral-300'}`} />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priorityLabel[task.priority] ?? 'text-neutral-500 bg-neutral-50'}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors leading-snug mb-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && !((task as any).descriptionHtml) && (
        <p className="text-xs text-neutral-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Subtask progress bar */}
      {(task as any).subtasks?.length > 0 && (() => {
        const subs = (task as any).subtasks
        const done = subs.filter((s: any) => s.status === 'Done').length
        const pct  = Math.round((done / subs.length) * 100)
        return (
          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
              <span>Subtasks</span><span>{done}/{subs.length}</span>
            </div>
            <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })()}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {due ? (
          <div className={`flex items-center gap-1 text-xs ${due.overdue ? 'text-red-500' : 'text-neutral-400'}`}>
            <Calendar className="w-3 h-3" />
            <span>{due.text}</span>
          </div>
        ) : <div />}

        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            {task.assignee.avatarUrl ? (
              <img src={task.assignee.avatarUrl} alt={task.assignee.fullName} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[9px] font-bold">
                {getInitials(task.assignee.fullName)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-neutral-300">
            <User className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  )
}
