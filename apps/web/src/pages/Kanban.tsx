import { useState, useEffect } from 'react'
import { Plus, Filter } from 'lucide-react'
import { KanbanColumn } from '../components/kanban/KanbanColumn'
import { TaskModal } from '../components/kanban/TaskModal'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import type { Project } from '@flareboard/types'

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

const COLUMNS = [
  { title: 'To Do', status: 'Todo', color: 'blue' },
  { title: 'In Progress', status: 'In Progress', color: 'yellow' },
  { title: 'Done', status: 'Done', color: 'green' },
]

export function KanbanPage() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<string>('Todo')

  useEffect(() => {
    fetchProjects()
    fetchTasks()
  }, [selectedProject])

  // Listen for real-time task updates
  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      const updatedTask = event.detail
      setTasks((prevTasks) => {
        const taskIndex = prevTasks.findIndex((t) => t.id === updatedTask.id)
        if (taskIndex >= 0) {
          // Update existing task
          const newTasks = [...prevTasks]
          newTasks[taskIndex] = { ...newTasks[taskIndex], ...updatedTask }
          return newTasks
        } else {
          // Add new task if it matches the current project filter
          if (selectedProject === 'all' || updatedTask.projectId === selectedProject) {
            return [...prevTasks, updatedTask]
          }
          return prevTasks
        }
      })
    }

    window.addEventListener('task:updated', handleTaskUpdate as EventListener)
    return () => {
      window.removeEventListener('task:updated', handleTaskUpdate as EventListener)
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setProjects(data.data)
        if (data.data.length > 0 && selectedProject === 'all') {
          setSelectedProject(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const url =
        selectedProject === 'all'
          ? 'http://localhost:3000/api/tasks'
          : `http://localhost:3000/api/tasks?projectId=${selectedProject}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = (_e: React.DragEvent) => {
    setDraggedTaskId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()

    if (!draggedTaskId) return

    const task = tasks.find((t) => t.id === draggedTaskId)
    if (!task || task.status === newStatus) return

    const oldStatus = task.status

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === draggedTaskId ? { ...t, status: newStatus } : t))
    )

    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${draggedTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        // Revert on failure
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === draggedTaskId ? { ...t, status: oldStatus } : t))
        )
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === draggedTaskId ? { ...t, status: oldStatus } : t))
      )
    }

    setDraggedTaskId(null)
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
      const response = await fetch(`http://localhost:3000/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const data = await response.json()
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === editingTask.id ? { ...t, ...data.data } : t))
      )
    } else {
      // Create new task
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const data = await response.json()
      setTasks((prevTasks) => [...prevTasks, data.data])
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status).sort((a, b) => a.position - b.position)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-600">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Kanban Board</h1>
          <p className="text-neutral-600 mt-1">Manage your tasks with drag and drop</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="primary" size="sm" onClick={() => handleAddTask('Todo')}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={getTasksByStatus(column.status)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onAddTask={handleAddTask}
            onTaskClick={handleTaskClick}
            color={column.color}
          />
        ))}
      </div>

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
