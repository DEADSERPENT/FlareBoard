import { useState, useEffect, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { FolderKanban, CheckCircle2, Clock, TrendingUp, AlertTriangle, Zap, Activity } from 'lucide-react'
import { API_BASE } from '../lib/api'
import { Card } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'

// Inline donut chart
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  if (total === 0) return <div className="w-28 h-28 rounded-full bg-neutral-100 mx-auto" />
  let offset = 0
  const r = 40, cx = 56, cy = 56, stroke = 14
  const circ = 2 * Math.PI * r
  return (
    <svg width={112} height={112} className="mx-auto -rotate-90">
      {segments.map((seg, i) => {
        const pct  = seg.value / total
        const dash = pct * circ
        const gap  = circ - dash
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="butt"
          />
        )
        offset += pct
        return el
      })}
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="white" />
    </svg>
  )
}

// Horizontal bar
function HBar({ label, value, max, color, sub }: { label: string; value: number; max: number; color: string; sub?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium text-neutral-800">{label}</span>
          {sub && <span className="text-xs text-neutral-400 ml-1.5">{sub}</span>}
        </div>
        <span className="text-xs font-semibold text-neutral-600 tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export const DashboardPage = () => {
  const { token } = useAuth()
  const { data: projects = [] } = useProjects()
  const { data: tasks = [] }    = useTasks()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE}/activity?limit=8`, { headers: { Authorization: `Bearer ${token}` } })
        const d = await r.json()
        if (d.success) setActivities(d.data.logs || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [token])

  const stats = useMemo(() => {
    const total       = tasks.length
    const done        = tasks.filter((t: any) => t.status === 'Done').length
    const inProgress  = tasks.filter((t: any) => t.status === 'In Progress').length
    const todo        = tasks.filter((t: any) => t.status === 'Todo').length
    const blocked     = tasks.filter((t: any) => t.status === 'Blocked').length
    const urgent      = tasks.filter((t: any) => t.priority === 'Urgent' && t.status !== 'Done').length
    const overdue     = tasks.filter((t: any) => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < new Date()).length
    const rate        = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, inProgress, todo, blocked, urgent, overdue, rate }
  }, [tasks])

  const projectStats = useMemo(() =>
    projects
      .map((p: any) => {
        const pts  = tasks.filter((t: any) => t.projectId === p.id)
        const done = pts.filter((t: any) => t.status === 'Done').length
        return { name: p.name, total: pts.length, done, rate: pts.length > 0 ? Math.round((done / pts.length) * 100) : 0 }
      })
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 5),
    [projects, tasks]
  )

  const maxProject = Math.max(...projectStats.map((p: any) => p.total), 1)

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Live overview of all projects and tasks</p>
      </div>

      {/* ── KPI row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: 'Total Projects', value: projects.length,   icon: FolderKanban, color: 'text-primary-600', bg: 'bg-primary-50',  accent: 'orange' as const },
          { label: 'Active Tasks',   value: stats.inProgress,  icon: Zap,          color: 'text-blue-600',   bg: 'bg-blue-50',     accent: 'blue' as const },
          { label: 'Done This Week', value: stats.done,        icon: CheckCircle2, color: 'text-emerald-600',bg: 'bg-emerald-50',  accent: 'green' as const },
          { label: 'Completion',     value: `${stats.rate}%`,  icon: TrendingUp,   color: 'text-purple-600', bg: 'bg-purple-50',   accent: 'purple' as const },
        ].map(({ label, value, icon: Icon, color, bg, accent }) => (
          <Card key={label} accent={accent} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
                <p className={`text-3xl font-black tabular-nums count-up ${color}`}>{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Alerts ───────────────────────────────────────────── */}
      {(stats.urgent > 0 || stats.overdue > 0 || stats.blocked > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.urgent > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700">
              <AlertTriangle className="w-4 h-4" />
              {stats.urgent} urgent task{stats.urgent > 1 ? 's' : ''}
            </div>
          )}
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-sm font-medium text-orange-700">
              <Clock className="w-4 h-4" />
              {stats.overdue} overdue
            </div>
          )}
          {stats.blocked > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-sm font-medium text-yellow-700">
              <AlertTriangle className="w-4 h-4" />
              {stats.blocked} blocked
            </div>
          )}
        </div>
      )}

      {/* ── Main grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Status donut + breakdown */}
        <Card accent="orange" className="card-hover">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4">Task Status</h3>
          <DonutChart segments={[
            { value: stats.done,       color: '#10b981', label: 'Done' },
            { value: stats.inProgress, color: '#f97316', label: 'In Progress' },
            { value: stats.todo,       color: '#3b82f6', label: 'To Do' },
            { value: stats.blocked,    color: '#ef4444', label: 'Blocked' },
          ]} />
          <div className="mt-4 space-y-2">
            {[
              { label: 'Done',        value: stats.done,       color: 'bg-emerald-500' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-primary-500' },
              { label: 'To Do',       value: stats.todo,       color: 'bg-blue-500' },
              { label: 'Blocked',     value: stats.blocked,    color: 'bg-red-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-neutral-600">{label}</span>
                </div>
                <span className="font-semibold text-neutral-900 tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Projects progress */}
        <Card accent="blue" className="card-hover">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4">Project Progress</h3>
          {projectStats.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-neutral-400 text-sm">No projects yet</div>
          ) : (
            <div className="space-y-4">
              {projectStats.map((p: any) => (
                <HBar key={p.name} label={p.name} value={p.total} max={maxProject}
                  sub={`${p.done}/${p.total} • ${p.rate}%`} color="bg-blue-500" />
              ))}
            </div>
          )}
        </Card>

        {/* Recent activity */}
        <Card accent="green" className="card-hover p-0 overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-neutral-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-neutral-700">Recent Activity</h3>
          </div>
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-neutral-400 text-sm">No activity yet</div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {activities.slice(0, 6).map((log: any) => {
                const isProject = log.entityType === 'project'
                const isTask    = log.entityType === 'task'
                return (
                  <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isProject ? 'bg-primary-100 text-primary-600' : isTask ? 'bg-blue-100 text-blue-600' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {isProject ? <FolderKanban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-800 capitalize">
                        {log.action.replace('.', ' ')}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </p>
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
