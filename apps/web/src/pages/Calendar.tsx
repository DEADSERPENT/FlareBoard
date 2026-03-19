import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTasks, useCreateTask, useUpdateTaskOptimistic } from '@/hooks/useTasks'
import { TaskModal } from '@/components/kanban/TaskModal'
import { useProjects } from '@/hooks/useProjects'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '@flareboard/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: 'bg-red-500',
  High: 'bg-orange-400',
  Medium: 'bg-yellow-400',
  Low: 'bg-green-400',
}

export const CalendarPage = () => {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { data: tasks = [] } = useTasks()
  const { data: projects = [] } = useProjects()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTaskOptimistic()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

    // Pad with prev month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false })
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true })
    }
    // Pad to 6 weeks
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
    }

    return days
  }, [year, month])

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    tasks.forEach((task: Task) => {
      if (!task.dueDate) return
      const key = new Date(task.dueDate).toDateString()
      if (!map[key]) map[key] = []
      map[key].push(task)
    })
    return map
  }, [tasks])

  const handleDayClick = (date: Date) => {
    const iso = date.toISOString().split('T')[0]
    setSelectedDate(iso)
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleSave = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({ id: editingTask.id, data: taskData as any })
    } else {
      await createTaskMutation.mutateAsync(taskData as any)
    }
  }

  // Stats for current month
  const monthStats = useMemo(() => {
    const monthTasks = tasks.filter((t: Task) => {
      if (!t.dueDate) return false
      const d = new Date(t.dueDate)
      return d.getFullYear() === year && d.getMonth() === month
    })
    return {
      total: monthTasks.length,
      done: monthTasks.filter((t: Task) => t.status === 'Done').length,
      overdue: monthTasks.filter((t: Task) => {
        return t.status !== 'Done' && new Date(t.dueDate!) < today
      }).length,
    }
  }, [tasks, year, month])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Calendar</h1>
          <p className="text-neutral-600 mt-1">View tasks by due date</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goToday}>Today</Button>
          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-neutral-50 transition-colors border-r border-neutral-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-sm font-semibold text-neutral-900 min-w-[140px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-neutral-50 transition-colors border-l border-neutral-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-900">{monthStats.total}</p>
            <p className="text-xs text-neutral-500 mt-1">Tasks due this month</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{monthStats.done}</p>
            <p className="text-xs text-neutral-500 mt-1">Completed</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{monthStats.overdue}</p>
            <p className="text-xs text-neutral-500 mt-1">Overdue</p>
          </div>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-neutral-500 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-neutral-100 rounded-lg overflow-hidden">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const key = date.toDateString()
            const dayTasks = tasksByDate[key] || []
            const isToday = date.toDateString() === today.toDateString()
            const isPast = date < today && !isToday

            return (
              <div
                key={idx}
                onClick={() => isCurrentMonth && handleDayClick(date)}
                className={`min-h-[100px] bg-white p-2 transition-colors ${
                  isCurrentMonth
                    ? 'cursor-pointer hover:bg-neutral-50'
                    : 'opacity-40 cursor-default'
                }`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                      isToday
                        ? 'bg-primary-500 text-white'
                        : isPast && isCurrentMonth
                        ? 'text-neutral-400'
                        : 'text-neutral-700'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs text-neutral-400">{dayTasks.length}</span>
                  )}
                </div>

                {/* Task chips — show up to 3 */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTaskClick(task)
                      }}
                      className={`w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate group ${
                        task.status === 'Done'
                          ? 'bg-neutral-100 text-neutral-400 line-through'
                          : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          task.status === 'Done'
                            ? 'bg-neutral-300'
                            : PRIORITY_COLORS[task.priority] || 'bg-neutral-400'
                        }`}
                      />
                      <span className="truncate">{task.title}</span>
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="text-xs text-neutral-400 pl-1">+{dayTasks.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <span className="font-medium">Priority:</span>
        {Object.entries(PRIORITY_COLORS).map(([p, cls]) => (
          <span key={p} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${cls}`} />
            {p}
          </span>
        ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null) }}
        onSave={handleSave}
        task={editingTask}
        projects={projects}
        defaultStatus="Todo"
      />
    </div>
  )
}
