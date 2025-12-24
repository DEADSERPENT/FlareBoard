import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Plus, FolderKanban, Calendar, User, TrendingUp, Edit, Trash2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export const ProjectsPage = () => {
  const { projects, loading: projectsLoading, refresh } = useProjects()
  const { tasks } = useTasks()
  const { token } = useAuth()
  const toast = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
  })

  const handleCreate = () => {
    setEditingProject(null)
    setFormData({ name: '', description: '', status: 'Active' })
    setIsModalOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Validation Error', 'Project name is required')
      return
    }

    setLoading(true)
    try {
      const url = editingProject
        ? `http://localhost:3000/api/projects/${editingProject.id}`
        : 'http://localhost:3000/api/projects'

      const response = await fetch(url, {
        method: editingProject ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Success', editingProject ? 'Project updated' : 'Project created')
        setIsModalOpen(false)
        await refresh()
      } else {
        toast.error('Error', data.error?.message || 'Operation failed')
      }
    } catch (error) {
      toast.error('Error', 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Success', 'Project deleted')
        setDeleteConfirmId(null)
        await refresh()
      } else {
        toast.error('Error', data.error?.message || 'Failed to delete project')
      }
    } catch (error) {
      toast.error('Error', 'Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Projects</h1>
          <p className="text-neutral-600 mt-1">Manage your projects and team collaboration</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-5 h-5" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Projects</p>
              <p className="text-2xl font-bold text-neutral-900">{projects.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Active Projects</p>
              <p className="text-2xl font-bold text-neutral-900">
                {projects.filter((p: any) => p.status === 'Active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Your Projects</p>
              <p className="text-2xl font-bold text-neutral-900">{projects.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="text-center py-16">
          <FolderKanban className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No projects yet</h3>
          <p className="text-neutral-600 mb-6">Get started by creating your first project</p>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-5 h-5" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => {
            const projectTasks = tasks.filter((t: any) => t.projectId === project.id)
            const completed = projectTasks.filter((t: any) => t.status === 'Done').length
            const total = projectTasks.length
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <Card key={project.id} className="card-hover group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{project.name}</h3>
                      <Badge variant={project.status === 'Active' ? 'success' : 'default'} className="mt-1">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-neutral-400 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-orange rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-neutral-900 font-medium">
                      {completed}/{total} tasks
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create Project'}
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project description..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : editingProject ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete this project? This action cannot be undone and will also
            delete all associated tasks.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
