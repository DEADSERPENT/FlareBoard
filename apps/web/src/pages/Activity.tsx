import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE } from '@/lib/api'
import { Activity as ActivityIcon, FolderKanban, CheckSquare, UserPlus, TrendingUp, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata?: any
  timestamp: Date
  user?: { id: string; fullName: string; avatarUrl?: string }
}

const FILTERS = ['all', 'project', 'task', 'user'] as const

function getActionStyle(action: string) {
  if (action.includes('created'))   return { bg: 'bg-emerald-100', text: 'text-emerald-600', dot: 'bg-emerald-500' }
  if (action.includes('updated'))   return { bg: 'bg-blue-100',    text: 'text-blue-600',    dot: 'bg-blue-500' }
  if (action.includes('completed')) return { bg: 'bg-purple-100',  text: 'text-purple-600',  dot: 'bg-purple-500' }
  if (action.includes('deleted') || action.includes('archived'))
    return { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' }
  return { bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' }
}

function getEntityIcon(entityType: string) {
  if (entityType === 'project') return FolderKanban
  if (entityType === 'task')    return CheckSquare
  if (entityType === 'user')    return UserPlus
  return ActivityIcon
}

function formatAction(action: string) {
  return action.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const ActivityPage = () => {
  const { token } = useAuth()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = filter !== 'all' ? `?entityType=${filter}` : ''
        const res    = await fetch(`${API_BASE}/activity${params}`, { headers: { Authorization: `Bearer ${token}` } })
        const data   = await res.json()
        if (data.success) setActivities(data.data.logs || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [filter, token])

  const countByType = {
    project: activities.filter(a => a.entityType === 'project').length,
    task:    activities.filter(a => a.entityType === 'task').length,
    user:    activities.filter(a => a.entityType === 'user').length,
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 page-enter max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Activity</h1>
        <p className="text-sm text-neutral-500 mt-0.5">A timeline of everything that's happened</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        {[
          { label: 'Total Actions',    value: activities.length,    icon: TrendingUp,  color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'green' as const },
          { label: 'Project Actions',  value: countByType.project,  icon: FolderKanban, color: 'text-blue-600',    bg: 'bg-blue-50',    accent: 'blue' as const },
          { label: 'Task Actions',     value: countByType.task,     icon: CheckSquare, color: 'text-purple-600',  bg: 'bg-purple-50',  accent: 'purple' as const },
        ].map(({ label, value, icon: Icon, color, bg, accent }) => (
          <Card key={label} accent={accent} className="card-hover p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
                <p className={`text-xl font-black tabular-nums count-up ${color}`}>{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <Card className="py-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">No activity yet</h3>
            <p className="text-sm text-neutral-400 max-w-xs">
              As you create projects and manage tasks, your timeline will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-neutral-100" />

          <div className="space-y-1">
            {activities.map((activity) => {
              const style  = getActionStyle(activity.action)
              const Icon   = getEntityIcon(activity.entityType)
              return (
                <div key={activity.id} className="relative flex items-start gap-4 pl-10 py-3 group">
                  {/* Timeline dot */}
                  <div className={`absolute left-[11px] w-[17px] h-[17px] rounded-full border-2 border-white ${style.dot} shadow-sm shrink-0`} />

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-xl border border-neutral-100 shadow-sm p-4 group-hover:border-neutral-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.text} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{formatAction(activity.action)}</p>
                          <p className="text-xs text-neutral-500 mt-0.5 capitalize">
                            {activity.entityType}
                            {activity.metadata?.projectName && ` · ${activity.metadata.projectName}`}
                            {activity.metadata?.taskTitle && ` · "${activity.metadata.taskTitle}"`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </div>
                    </div>

                    {activity.user && (
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-50">
                        {activity.user.avatarUrl ? (
                          <img src={activity.user.avatarUrl} alt={activity.user.fullName} className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[9px] font-bold">
                            {getInitials(activity.user.fullName)}
                          </div>
                        )}
                        <span className="text-xs text-neutral-500">{activity.user.fullName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
