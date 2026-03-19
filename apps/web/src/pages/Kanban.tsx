import { useState, useEffect, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from '@dnd-kit/core'
import { Plus, X, FolderKanban, Flag, Users, Kanban } from 'lucide-react'
import { KanbanColumn } from '../components/kanban/KanbanColumn'
import { TaskCard } from '../components/kanban/TaskCard'
import { TaskModal } from '../components/kanban/TaskModal'
import { Button } from '../components/ui/Button'
import {
  useProjects,
  useTasks,
  useCreateTask,
  useUpdateTaskOptimistic,
} from '../hooks/useTasks'
import { useUsers } from '../hooks/useUsers'
import type { Task } from '@flareboard/types'

const COLUMNS = [
  { title: 'To Do', status: 'Todo', color: 'blue' },
  { title: 'In Progress', status: 'In Progress', color: 'yellow' },
  { title: 'Done', status: 'Done', color: 'green' },
]

export function KanbanPage() {
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<string>('Todo')

  // Fetch data using TanStack Query hooks
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: users = [] } = useUsers()
  const projectId = selectedProject === 'all' ? undefined : selectedProject
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useTasks(projectId)

  // Mutations
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTaskOptimistic()

  // DnD Sensors - require 5px movement before dragging starts
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Auto-select first project on load
  useEffect(() => {
    if (projects.length > 0 && selectedProject === 'all') {
      setSelectedProject(projects[0].id)
    }
  }, [projects, selectedProject])

  // Listen for real-time task updates from WebSocket
  useEffect(() => {
    const handleTaskUpdate = () => {
      refetchTasks()
    }

    window.addEventListener('task:updated', handleTaskUpdate as EventListener)
    return () => {
      window.removeEventListener('task:updated', handleTaskUpdate as EventListener)
    }
  }, [refetchTasks])

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: You can add visual feedback here if needed
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTaskData = tasks.find((t) => t.id === activeId)
    if (!activeTaskData) return

    // Case 1: Dropped on a Column (status zone)
    if (over.data.current?.type === 'Column') {
      const newStatus = over.id as string
      if (activeTaskData.status !== newStatus) {
        await updateTaskMutation.mutateAsync({
          id: activeId,
          data: { status: newStatus as any },
        })
      }
      return
    }

    // Case 2: Dropped on another Task
    if (over.data.current?.type === 'Task') {
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask) return

      const isSameColumn = activeTaskData.status === overTask.status

      if (isSameColumn) {
        // Reordering within same column
        if (activeId !== overId) {
          await updateTaskMutation.mutateAsync({
            id: activeId,
            data: { position: overTask.position },
          })
        }
      } else {
        // Moving to different column
        await updateTaskMutation.mutateAsync({
          id: activeId,
          data: {
            status: overTask.status as any,
            position: overTask.position,
          },
        })
      }
    }
  }

  const handleAddTask = (status: string) => {
    setEditingTask(null)
    setDefaultStatus(status)
    setIsModalOpen(true)
  }

  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      // Update existing task
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        data: taskData as any,
      })
    } else {
      // Create new task
      await createTaskMutation.mutateAsync(taskData as any)
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false
      if (filterAssignee !== 'all' && task.assignedTo !== filterAssignee) return false
      return true
    })
  }, [tasks, filterPriority, filterAssignee])

  const getTasksByStatus = useMemo(
    () => (status: string) => {
      return filteredTasks.filter((task) => task.status === status).sort((a, b) => a.position - b.position)
    },
    [filteredTasks]
  )

  const hasActiveFilters = filterPriority !== 'all' || filterAssignee !== 'all'

  const loading = projectsLoading || tasksLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Kanban className="w-5 h-5 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Kanban Board</h1>
            <p className="text-neutral-500 text-sm">Drag and drop to manage task status</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-lg">
            <FolderKanban className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="text-sm focus:outline-none bg-transparent text-neutral-700"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-lg">
            <Flag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-sm focus:outline-none bg-transparent text-neutral-700"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-lg">
            <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="text-sm focus:outline-none bg-transparent text-neutral-700"
            >
              <option value="all">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setFilterPriority('all'); setFilterAssignee('all') }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          <Button variant="primary" size="sm" onClick={() => handleAddTask('Todo')}>
            <Plus className="w-4 h-4 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              title={column.title}
              status={column.status}
              tasks={getTasksByStatus(column.status)}
              onAddTask={handleAddTask}
              onTaskClick={handleTaskClick}
              color={column.color}
            />
          ))}
        </div>

        {/* Ghost Overlay - The card that follows your cursor */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 cursor-grabbing opacity-90 shadow-2xl">
              <TaskCard
                task={activeTask}
                onClick={() => {}}
                onDragStart={() => {}}
                onDragEnd={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        task={editingTask}
        projects={projects}
        defaultStatus={defaultStatus}
        defaultProjectId={selectedProject !== 'all' ? selectedProject : undefined}
      />
    </div>
  )
}
