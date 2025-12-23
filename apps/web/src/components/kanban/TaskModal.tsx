import { useState, useEffect, FormEvent } from 'react'
import { Calendar, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'

interface Task {
  id?: string
  title: string
  description?: string
  status: string
  priority: string
  projectId: string
  position?: number
  assignedTo?: string | null
  dueDate?: string | Date | null
  assignee?: {
    id: string
    fullName: string
    email: string
    avatarUrl?: string | null
  } | null
}

interface Project {
  id: string
  name: string
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => Promise<void>
  task?: Task | null
  projects: Project[]
  defaultStatus?: string
  defaultProjectId?: string
}

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  projects,
  defaultStatus,
  defaultProjectId,
}: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: defaultStatus || 'Todo',
    priority: 'Medium',
    projectId: defaultProjectId || '',
    assignedTo: null,
    dueDate: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus || 'Todo',
        priority: 'Medium',
        projectId: defaultProjectId || '',
        assignedTo: null,
        dueDate: null,
      })
    }
  }, [task, defaultStatus, defaultProjectId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.projectId) {
      setError('Title and project are required')
      return
    }

    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
            Task Title *
          </label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add task description..."
            rows={3}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-neutral-700 mb-2">
              Project *
            </label>
            <select
              id="project"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900"
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900"
            >
              <option value="Todo">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-2">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Priority
              </div>
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-700 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due Date
              </div>
            </label>
            <Input
              id="dueDate"
              type="date"
              value={
                formData.dueDate
                  ? typeof formData.dueDate === 'string'
                    ? formData.dueDate
                    : formData.dueDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || null })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
