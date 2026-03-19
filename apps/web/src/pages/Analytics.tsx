import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useUsers } from '@/hooks/useUsers'
import { BarChart2, TrendingUp, Target, Clock, CheckCircle2, AlertCircle, FolderKanban } from 'lucide-react'
import type { Task } from '@flareboard/types'

function BarRow({ label, value, max, color, suffix = '' }: {
  label: string; value: number; max: number; color: string; suffix?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-700 font-medium truncate max-w-[60%]">{label}</span>
        <span className="font-bold text-neutral-900 tabular-nums">{value}{suffix}</span>
      </div>
      <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${color}`}
             style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-neutral-300" />
      </div>
      <p className="text-sm font-medium text-neutral-500">{text}</p>
    </div>
  )
}

export const AnalyticsPage = () => {
  const { data: projects = [] } = useProjects()
  const { data: tasks = [] }    = useTasks()
  const { data: users = [] }    = useUsers()

  const stats = useMemo(() => {
    const total      = tasks.length
    const done       = tasks.filter((t: Task) => t.status === 'Done').length
    const inProgress = tasks.filter((t: any) => t.status === 'In Progress').length
    const todo       = tasks.filter((t: Task) => t.status === 'Todo').length
    const blocked    = tasks.filter((t: Task) => t.status === 'Blocked').length
    const overdue    = tasks.filter((t: Task) => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < new Date()).length
    const rate       = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, inProgress, todo, blocked, overdue, rate }
  }, [tasks])

  const tasksByProject = useMemo(() =>
    projects
      .map((p: any) => {
        const pts  = tasks.filter((t: Task) => t.projectId === p.id)
        const done = pts.filter((t: Task) => t.status === 'Done').length
        return { name: p.name, total: pts.length, done, rate: pts.length > 0 ? Math.round((done / pts.length) * 100) : 0 }
      })
      .sort((a: any, b: any) => b.total - a.total),
    [projects, tasks]
  )

  const tasksByAssignee = useMemo(() =>
    users
      .map((u: any) => {
        const uts  = tasks.filter((t: Task) => t.assignedTo === u.id)
        const done = uts.filter((t: Task) => t.status === 'Done').length
        return { name: u.fullName, total: uts.length, done, active: uts.length - done, rate: uts.length > 0 ? Math.round((done / uts.length) * 100) : 0 }
      })
      .sort((a: any, b: any) => b.total - a.total),
    [users, tasks]
  )

  const tasksByPriority = useMemo(() =>
    ['Urgent', 'High', 'Medium', 'Low'].map(p => ({
      name: p, total: tasks.filter((t: Task) => t.priority === p).length,
    })),
    [tasks]
  )

  const maxByProject  = Math.max(...tasksByProject.map((p: any) => p.total), 1)
  const maxByAssignee = Math.max(...tasksByAssignee.map((u: any) => u.total), 1)
  const maxByPriority = Math.max(...tasksByPriority.map(p => p.total), 1)

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Project and task performance at a glance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[
          { label: 'Total Tasks',      value: stats.total,      color: 'text-primary-600', bg: 'bg-primary-50',  icon: BarChart2,    accent: 'orange' as const },
          { label: 'Completion Rate',  value: `${stats.rate}%`, color: 'text-emerald-600', bg: 'bg-emerald-50',  icon: CheckCircle2, accent: 'green' as const },
          { label: 'Overdue',          value: stats.overdue,    color: 'text-red-600',     bg: 'bg-red-50',      icon: AlertCircle,  accent: 'red' as const },
          { label: 'In Progress',      value: stats.inProgress, color: 'text-blue-600',    bg: 'bg-blue-50',     icon: Clock,        accent: 'blue' as const },
        ].map(({ label, value, color, bg, icon: Icon, accent }) => (
          <Card key={label} accent={accent} className="card-hover p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
                <p className={`text-2xl font-black tabular-nums count-up ${color}`}>{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card accent="orange" className="card-hover">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-primary-500" />
            <h3 className="text-sm font-semibold text-neutral-800">Tasks by Status</h3>
          </div>
          <div className="space-y-4">
            <BarRow label="Done"        value={stats.done}       max={stats.total} color="bg-emerald-500" />
            <BarRow label="In Progress" value={stats.inProgress} max={stats.total} color="bg-amber-400" />
            <BarRow label="To Do"       value={stats.todo}       max={stats.total} color="bg-blue-400" />
            <BarRow label="Blocked"     value={stats.blocked}    max={stats.total} color="bg-red-400" />
          </div>
          {stats.total > 0 && (
            <div className="mt-5 flex gap-0.5 h-2.5 rounded-full overflow-hidden">
              {[
                { v: stats.done,       c: 'bg-emerald-500' },
                { v: stats.inProgress, c: 'bg-amber-400' },
                { v: stats.todo,       c: 'bg-blue-400' },
                { v: stats.blocked,    c: 'bg-red-400' },
              ].filter(x => x.v > 0).map(({ v, c }, i) => (
                <div key={i} className={c} style={{ width: `${(v / stats.total) * 100}%` }} />
              ))}
            </div>
          )}
        </Card>

        <Card accent="purple" className="card-hover">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-neutral-800">Tasks by Priority</h3>
          </div>
          <div className="space-y-4">
            {tasksByPriority.map(({ name, total }) => (
              <BarRow key={name} label={name} value={total} max={maxByPriority}
                color={name === 'Urgent' ? 'bg-red-500' : name === 'High' ? 'bg-orange-400' : name === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'} />
            ))}
          </div>
        </Card>
      </div>

      {/* By project */}
      <Card accent="blue" className="card-hover">
        <div className="flex items-center gap-2 mb-5">
          <FolderKanban className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-neutral-800">Tasks by Project</h3>
        </div>
        {tasksByProject.length === 0 ? (
          <EmptyState icon={FolderKanban} text="No projects yet — create one to see stats here" />
        ) : (
          <div className="space-y-5">
            {tasksByProject.map((p: any) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-neutral-800 truncate max-w-[60%]">{p.name}</span>
                  <span className="text-neutral-500 text-xs">{p.done}/{p.total} done · {p.rate}%</span>
                </div>
                <div className="relative h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary-200 rounded-full"
                       style={{ width: `${(p.total / maxByProject) * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-700"
                       style={{ width: `${p.total > 0 ? (p.done / maxByProject) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* By assignee */}
      <Card accent="green" className="card-hover">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-neutral-800">Workload by Member</h3>
        </div>
        {tasksByAssignee.filter((u: any) => u.total > 0).length === 0 ? (
          <EmptyState icon={TrendingUp} text="No tasks assigned yet" />
        ) : (
          <div className="space-y-4">
            {tasksByAssignee.filter((u: any) => u.total > 0).map((u: any) => (
              <div key={u.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <BarRow label={u.name} value={u.total} max={maxByAssignee} color="bg-primary-400" />
                </div>
                <div className="text-xs text-neutral-400 shrink-0 w-24 text-right tabular-nums">
                  {u.done} done · {u.active} active
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
