import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useUsers } from '@/hooks/useUsers'
import {
  BarChart2,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
} from 'lucide-react'
import type { Task } from '@flareboard/types'

function BarRow({
  label,
  value,
  max,
  color,
  suffix = '',
}: {
  label: string
  value: number
  max: number
  color: string
  suffix?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-700 truncate max-w-[60%]">{label}</span>
        <span className="font-semibold text-neutral-900">
          {value}{suffix}
        </span>
      </div>
      <div className="relative h-2.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export const AnalyticsPage = () => {
  const { data: projects = [] } = useProjects()
  const { data: tasks = [] } = useTasks()
  const { data: users = [] } = useUsers()

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t: Task) => t.status === 'Done').length
    const inProgress = tasks.filter((t: Task) => t.status === 'In Progress').length
    const todo = tasks.filter((t: Task) => t.status === 'Todo').length
    const blocked = tasks.filter((t: Task) => t.status === 'Blocked').length
    const overdue = tasks.filter(
      (t: Task) => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length
    const rate = total > 0 ? Math.round((done / total) * 100) : 0

    return { total, done, inProgress, todo, blocked, overdue, rate }
  }, [tasks])

  const tasksByProject = useMemo(() => {
    return projects
      .map((p: any) => {
        const pts = tasks.filter((t: Task) => t.projectId === p.id)
        const done = pts.filter((t: Task) => t.status === 'Done').length
        return { name: p.name, total: pts.length, done, rate: pts.length > 0 ? Math.round((done / pts.length) * 100) : 0 }
      })
      .sort((a, b) => b.total - a.total)
  }, [projects, tasks])

  const tasksByAssignee = useMemo(() => {
    return users
      .map((u) => {
        const uts = tasks.filter((t: Task) => t.assignedTo === u.id)
        const done = uts.filter((t: Task) => t.status === 'Done').length
        return {
          name: u.fullName,
          total: uts.length,
          done,
          active: uts.length - done,
          rate: uts.length > 0 ? Math.round((done / uts.length) * 100) : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
  }, [users, tasks])

  const tasksByPriority = useMemo(() => {
    const priorities = ['Urgent', 'High', 'Medium', 'Low']
    return priorities.map((p) => ({
      name: p,
      total: tasks.filter((t: Task) => t.priority === p).length,
    }))
  }, [tasks])

  const maxByProject = Math.max(...tasksByProject.map((p) => p.total), 1)
  const maxByAssignee = Math.max(...tasksByAssignee.map((u) => u.total), 1)
  const maxByPriority = Math.max(...tasksByPriority.map((p) => p.total), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Analytics</h1>
        <p className="text-neutral-600 mt-1">Project and task performance at a glance</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Total Tasks</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.rate}%</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-neutral-900">Tasks by Status</h3>
          </div>
          <div className="space-y-4">
            <BarRow label="Done" value={stats.done} max={stats.total} color="bg-green-500" />
            <BarRow label="In Progress" value={stats.inProgress} max={stats.total} color="bg-yellow-400" />
            <BarRow label="To Do" value={stats.todo} max={stats.total} color="bg-blue-400" />
            <BarRow label="Blocked" value={stats.blocked} max={stats.total} color="bg-red-400" />
          </div>
          {/* Summary strip */}
          <div className="mt-6 flex gap-1 h-3 rounded-full overflow-hidden">
            {stats.done > 0 && (
              <div className="bg-green-500" style={{ width: `${(stats.done / stats.total) * 100}%` }} />
            )}
            {stats.inProgress > 0 && (
              <div className="bg-yellow-400" style={{ width: `${(stats.inProgress / stats.total) * 100}%` }} />
            )}
            {stats.todo > 0 && (
              <div className="bg-blue-400" style={{ width: `${(stats.todo / stats.total) * 100}%` }} />
            )}
            {stats.blocked > 0 && (
              <div className="bg-red-400" style={{ width: `${(stats.blocked / stats.total) * 100}%` }} />
            )}
            {stats.total === 0 && <div className="bg-neutral-100 w-full" />}
          </div>
        </Card>

        {/* Tasks by Priority */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-neutral-900">Tasks by Priority</h3>
          </div>
          <div className="space-y-4">
            {tasksByPriority.map(({ name, total }) => (
              <BarRow
                key={name}
                label={name}
                value={total}
                max={maxByPriority}
                color={
                  name === 'Urgent'
                    ? 'bg-red-500'
                    : name === 'High'
                    ? 'bg-orange-400'
                    : name === 'Medium'
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
                }
              />
            ))}
          </div>
        </Card>
      </div>

      {/* By Project */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <FolderKanban className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Tasks by Project</h3>
        </div>
        {tasksByProject.length === 0 ? (
          <p className="text-neutral-500 text-sm">No projects yet</p>
        ) : (
          <div className="space-y-5">
            {tasksByProject.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-neutral-800 truncate max-w-[60%]">{p.name}</span>
                  <span className="text-neutral-500">
                    {p.done}/{p.total} done ({p.rate}%)
                  </span>
                </div>
                <div className="relative h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${(p.total / maxByProject) * 100}%`, opacity: 0.2 }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${p.total > 0 ? (p.done / maxByProject) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* By Assignee */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Workload by Member</h3>
        </div>
        {tasksByAssignee.length === 0 ? (
          <p className="text-neutral-500 text-sm">No team members yet</p>
        ) : (
          <div className="space-y-4">
            {tasksByAssignee.map((u) => (
              <div key={u.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold shrink-0">
                  {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <BarRow
                    label={u.name}
                    value={u.total}
                    max={maxByAssignee}
                    color="bg-primary-400"
                  />
                </div>
                <div className="text-xs text-neutral-500 shrink-0 w-20 text-right">
                  {u.done} done, {u.active} active
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
