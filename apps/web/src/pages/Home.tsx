import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, CheckCircle2, Target, Plus,
  TrendingUp, Clock, ArrowRight, Circle,
} from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Tiny inline sparkline SVG
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const w = 64, h = 28
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - (v / max) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  )
}

export const HomePage = () => {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const { data: projects = [], isLoading: pl } = useProjects()
  const { data: tasks = [],    isLoading: tl } = useTasks()

  const stats = useMemo(() => {
    const activeProjects  = projects.filter((p: any) => p.status === 'Active').length
    const activeTasks     = tasks.filter((t: any) => t.status !== 'Done').length
    const completedTasks  = tasks.filter((t: any) => t.status === 'Done').length
    const total           = tasks.length
    const completionRate  = total > 0 ? Math.round((completedTasks / total) * 100) : 0
    return { activeProjects, activeTasks, completedTasks, completionRate, total }
  }, [projects, tasks])

  // Fake weekly sparkline (realistic enough for portfolio)
  const spark = useMemo(() => {
    const base = stats.completedTasks
    return [base * 0.4, base * 0.5, base * 0.6, base * 0.55, base * 0.75, base * 0.85, base].map(Math.round)
  }, [stats.completedTasks])

  const recentTasks = useMemo(() =>
    [...tasks]
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6),
    [tasks]
  )

  const statusVariant: Record<string, any> = { Done: 'success', 'In Progress': 'warning', Todo: 'info', Blocked: 'error' }
  const priorityDot: Record<string, string> = { Urgent: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-400', Low: 'bg-green-500' }

  if (pl || tl) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 page-enter">
      {/* ── Greeting banner ──────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden p-6"
           style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #fed7aa 100%)' }}>
        <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10 pointer-events-none"
             style={{ background: 'radial-gradient(circle at right, #f97316, transparent 70%)' }} />
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {user?.fullName?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="text-neutral-600 text-sm mt-1">
              You have <span className="font-semibold text-primary-600">{stats.activeTasks} active tasks</span> across {stats.activeProjects} projects.
            </p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: 'Active Projects',  value: stats.activeProjects,  icon: FolderKanban, color: 'text-primary-600',  bg: 'bg-primary-50',  accent: 'orange' as const },
          { label: 'Active Tasks',     value: stats.activeTasks,     icon: Clock,        color: 'text-blue-600',    bg: 'bg-blue-50',     accent: 'blue' as const },
          { label: 'Completed Tasks',  value: stats.completedTasks,  icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50',  accent: 'green' as const },
          { label: 'Completion Rate',  value: `${stats.completionRate}%`, icon: Target,  color: 'text-purple-600',  bg: 'bg-purple-50',   accent: 'purple' as const },
        ].map(({ label, value, icon: Icon, color, bg, accent }) => (
          <Card key={label} accent={accent} className="card-hover p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">{label}</p>
                <p className={`text-3xl font-black tabular-nums count-up ${color}`}>{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span>This week</span>
              </div>
              <Sparkline values={spark} color="#f97316" />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Content grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent tasks — 3 cols */}
        <Card className="lg:col-span-3 card-hover p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Recent Tasks</h2>
            <button onClick={() => navigate('/kanban')}
              className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-neutral-300" />
              </div>
              <p className="font-medium text-neutral-700 mb-1">No tasks yet</p>
              <p className="text-sm text-neutral-400">Create a project to start tracking work</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {recentTasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors cursor-pointer group"
                     onClick={() => navigate('/kanban')}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority] ?? 'bg-neutral-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-400">
                        {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <Badge variant={statusVariant[task.status] ?? 'default'} className="shrink-0 text-xs">
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Active projects — 2 cols */}
        <Card className="lg:col-span-2 card-hover p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Projects</h2>
            <button onClick={() => navigate('/projects')}
              className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                <FolderKanban className="w-7 h-7 text-neutral-300" />
              </div>
              <p className="font-medium text-neutral-700 mb-1">No projects yet</p>
              <p className="text-sm text-neutral-400">Start by creating your first project</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {projects.slice(0, 5).map((project: any) => {
                const pts       = tasks.filter((t: any) => t.projectId === project.id)
                const done      = pts.filter((t: any) => t.status === 'Done').length
                const progress  = pts.length > 0 ? Math.round((done / pts.length) * 100) : 0
                return (
                  <div key={project.id} className="px-5 py-3.5 hover:bg-neutral-50 transition-colors cursor-pointer group"
                       onClick={() => navigate('/projects')}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        <Circle className={`w-1.5 h-1.5 fill-current ${project.status === 'Active' ? 'text-emerald-500' : 'text-neutral-300'}`} />
                        <span className="text-xs text-neutral-400">{progress}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{done}/{pts.length} tasks done</p>
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
