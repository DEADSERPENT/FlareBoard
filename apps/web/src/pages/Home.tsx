import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import {
  FolderKanban,
  CheckCircle2,
  Users,
  Target,
  Plus,
  TrendingUp,
  Clock,
  Circle,
} from 'lucide-react'
import { useMemo } from 'react'

export const HomePage = () => {
  const { projects, loading: projectsLoading } = useProjects()
  const { tasks, loading: tasksLoading } = useTasks()

  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'Active').length
    const activeTasks = tasks.filter(t => t.status !== 'Done').length
    const completedTasks = tasks.filter(t => t.status === 'Done').length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      activeProjects,
      activeTasks,
      completedTasks,
      completionRate,
    }
  }, [projects, tasks])

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }, [tasks])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      Done: 'success',
      InProgress: 'warning',
      Todo: 'info',
      Blocked: 'error',
    }
    return variants[status] || 'default'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Urgent: 'text-red-600',
      High: 'text-orange-600',
      Medium: 'text-yellow-600',
      Low: 'text-green-600',
    }
    return colors[priority] || 'text-neutral-600'
  }

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Welcome back, Samartha</h1>
          <p className="text-neutral-600 mt-1">Here's what's happening with your projects</p>
        </div>
        <Button variant="primary">
          <Plus className="w-5 h-5" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Active Projects</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-neutral-600">Total: {projects.length} projects</span>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Active Tasks</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.activeTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-neutral-600">{stats.completedTasks} completed</span>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Team Members</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">8</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
            <span className="text-neutral-600">3 online now</span>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.completionRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-orange rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="card-hover">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Tasks</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No tasks yet</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className={`mt-0.5 ${getPriorityColor(task.priority)}`}>
                    <Circle className="w-2 h-2 fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-neutral-900 truncate">{task.title}</p>
                      <Badge variant={getStatusBadge(task.status)} className="shrink-0">
                        {task.status}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-neutral-600 truncate mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.updatedAt).toLocaleDateString()}
                      </span>
                      <Badge variant="default" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Active Projects */}
        <Card className="card-hover">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Active Projects</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No projects yet</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id)
                const completed = projectTasks.filter(t => t.status === 'Done').length
                const total = projectTasks.length
                const progress = total > 0 ? (completed / total) * 100 : 0

                return (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-orange-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">{project.name}</h3>
                        {project.description && (
                          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={project.status === 'Active' ? 'success' : 'default'}
                        className="shrink-0"
                      >
                        {project.status}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-neutral-600 mb-1">
                        <span>
                          {completed} / {total} tasks
                        </span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-orange rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
