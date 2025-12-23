import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { Plus, FolderKanban, Calendar, User, MoreVertical, TrendingUp } from 'lucide-react'

export const ProjectsPage = () => {
  const { projects, loading: projectsLoading } = useProjects()
  const { tasks } = useTasks()

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
        <Button variant="primary">
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
                {projects.filter(p => p.status === 'Active').length}
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
          <p className="text-neutral-600 mb-6">
            Get started by creating your first project
          </p>
          <Button variant="primary">
            <Plus className="w-5 h-5" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id)
            const completed = projectTasks.filter(t => t.status === 'Done').length
            const total = projectTasks.length
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <Card key={project.id} className="card-hover group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                        {project.name}
                      </h3>
                      <Badge
                        variant={project.status === 'Active' ? 'success' : 'default'}
                        className="mt-1"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <button className="text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {project.description && (
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
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
    </div>
  )
}
